# -*- coding: utf-8 -*-

import codecs
import json
import logging
import os
import random
import re
import smtplib
import subprocess
import threading
import traceback

from configparser import ConfigParser
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import Flask, request
from string import Template

if not os.path.exists('tmp'):
    try:
        os.makedirs('tmp')
    except BaseException as exception:
        traceback.print_exc(1)

config = ConfigParser()
config.read('config.ini')

app = Flask(__name__, static_folder='', static_url_path='')

@app.route('/submit/', methods = ['POST'], strict_slashes = False)
def submit():
    '''Handles form submission:
        - generates STA pdf for investigator
        - sends email to investigator
        - sends form values to pm

    The form data should be provided as a json object with the following properties: {
        first: "investigator's first name",
        last: "investigator's last name",
        job_title: "investigator's job title",
        phone: "investigator's phone number",
        email: "investigator's email address",

        institution: "investigator's institution",
        address: "investigator's institution address",
        purpose: "intended usage of software components",

        software_titles: "array containing requested software component titles",
        software_descriptions: "array containing requested software component descriptions",

        discovery_mechanism: "how investigator discovered this software/tool",
    }

    Decorators:
        app -- Flask route decorator
    '''
    # create /tmp directory if does not exist already
    if not os.path.exists('tmp'):
        try:
            os.makedirs('tmp')
        except BaseException as exception:
            traceback.print_exc(1)

    wrap_tag = lambda tag: \
        lambda content: \
            '<{tag}>{content}</{tag}>' \
                .format(tag=tag, content=content)

    try:
        input = request.stream.read().decode()
        data = json.loads(re.sub(r'<[^>]*?>|\n', ', ', input))
        data['software_titles'] = ''.join(map(wrap_tag('li'), data['software_titles']))
        data['software_descriptions'] = ''.join(map(wrap_tag('p'), data['software_descriptions']))

        token_id = random.randrange(1000000, 9000000)

        input_file = 'tmp/NCIDose_STA_%s.html' % token_id
        output_file = 'tmp/NCIDose_STA_%s.pdf' % token_id

        logging.info('creating input file: ' + input_file)
        with codecs.open('templates/sta.html', mode='r', encoding='utf-8') as sta_template, \
             codecs.open(input_file, mode='w', encoding='utf-8') as input_template:
            input_template.write(Template(sta_template.read()).safe_substitute(**data))

        def execute():
            logging.info('creating output file: ' + output_file)
            subprocess.call([
                'java', '-jar', 'html2pdf.jar',
                '--input', input_file,
                '--output', output_file,
                '--title', 'Software Transfer Agreement',
                '--header', 'NCI Reference # ____________',
                '--numbered'
            ])

            host = config.get('mail', 'host')
            admin = config.get('mail', 'admin')

            logging.info('sending email to provider')
            with codecs.open('templates/provider-email.html', mode='r', encoding='utf-8') as template:
                send_mail(
                    host=host,
                    sender='NCIDOSEWebAdmin@mail.nih.gov',
                    recipient=admin,
                    subject='NCIDose STA Request',
                    contents=Template(template.read()).safe_substitute(**data)
                )

            logging.info('sending email to recipient investigator')
            with codecs.open('templates/recipient-email.html', mode='r', encoding='utf-8') as template:
                send_mail(
                    host=host,
                    sender='NCIDOSEWebAdmin@mail.nih.gov',
                    recipient=data['email'],
                    subject='NCIDose Software Transfer Agreement Form',
                    contents=Template(template.read()).safe_substitute(**data),
                    attachments=[output_file]
                )

            logging.info('deleting pii')
            os.remove(input_file)
            os.remove(output_file)

        threading.Thread(target=execute).start()

    except BaseException as exception:
        print('------------EXCEPTION------------')
        traceback.print_exc(1)
        return str(exception), 400

    return 'success'

def send_mail(host, sender, recipient, subject, contents, attachments=None):
    """Sends an email to the provided recipient

    Arguments:
        - host {string} -- The smtp host
        - sender {string} -- The sender of the email
        - recipient {string} -- The recipient of the email
        - subject {string} -- The email's subject
        - contents {string} -- The email's contents

    Keyword Arguments:
        - attachments {string[]} -- Filenames of attachments (default: {None})
    """
    message = MIMEMultipart()
    message['Subject'] = subject
    message['From'] = sender
    message['To'] = recipient

    # set text for message
    message.attach(MIMEText(contents.encode('utf-8'), 'html', 'utf-8'))

    # add attachments to message
    if attachments is not None:
        for attachment in attachments:
            with open(attachment, 'rb') as _file:
                message.attach(MIMEApplication(
                    _file.read(),
                    Name=os.path.basename(attachment)
                ))

    # send email
    smtplib.SMTP(host).sendmail(sender, recipient, message.as_string())

if __name__ == '__main__':

    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
        return response

    app.run(host='0.0.0.0', port=9200, debug=True)
