import json
import logging
import os
import random
import smtplib
import subprocess

from ConfigParser import SafeConfigParser
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import Flask, request

if not os.path.exists('tmp'):
    os.makedirs('tmp')

config = SafeConfigParser()
config.read('config.ini')

app = Flask(__name__)

###############################################################################
## email template for investigators
###############################################################################
recipient_template = '''
<p>Dear {first} {last},</p>

<p>Thank you for your interest in the materials and software developed by the Dosimetry 
Unit of Radiation Epidemiology Branch at the <a href="https://dceg.cancer.gov/"> 
Division of Cancer Epidemiology and Genetics.</a> Attached is the STA form pre-filled 
with the information you entered on the web site and the materials you want to receive. 
Please review the STA form and email a signed copy to Dr. Choonsik Lee at 
leechoonsik@mail.nih.gov. You will be receiving an email with detailed download 
instructions once your STA form has been received and approved by Dr. Lee and NCI 
Technology Tranfer Center.</p>

<p><i>(Note: Please do not reply to this email. If you need assistance, 
please contact Dr. Choonsik Lee at leechoonsik@mail.nih.gov)</p></i>

</br>

<p>Sincerely,</p>
<p>Sent from the NCIDose Web Tool</p>
<p>NCIDOSEWebAdmin@mail.nih.gov</p>
'''


###############################################################################
## email template for Dr. Lee
###############################################################################
pm_template = '''
<h2>NCIDose</h2>

<p>Dear Dr. Lee,</p>

<p>This email is to let you know a user just visited the NCIDose web site and entered 
the following information on the Agreement page. A STA PDF has been generated and sent 
to the user via email.</p>

<p><b><u>Materials to download</u></b></p>
<ul>
    {software_title}
</ul>

<p><b><u>Recipient Investigator</u></b></p>
<ul>
    <li>Name: {first} {last}</li>
    <li>Title: {title}</li>
    <li>Email: {email}</li>
    <li>Phone: {phone}</li>
    <li>Institution: {institution}</li>
    <li>Business Address: {address}</li>
</ul>

<p><b><u>Research Activity</u></b></p>
<ul>
    <li>{purpose}</li>
</ul>

</br>

<p>Sincerely,</p>
<p>Sent from the NCIDose Web Tool</p>
<p>NCIDOSEWebAdmin@mail.nih.gov</p>
'''

@app.route('/submit/', methods = ['POST'], strict_slashes = False)
def submit():
    '''Handles form submission:
        - stores form values
        - generates STA pdf for investigator
        - sends email to investigator
        - sends form values to pm

    Decorators:
        app -- Flask route decorator
    '''

    try:
        data = json.loads(request.stream.read())
        token_id = random.randrange(1, 1000000)

        json_file = 'tmp/%s_inputs.json' % token_id
        pdf_file = 'tmp/NCIDose_STA_%s.pdf' % token_id

        logging.info('storing parameters: ' + json_file)

        with open(json_file, 'w') as _file:
            json.dump(data, _file)

        logging.info('creating pdf: ' + pdf_file)
        subprocess.call(['java', '-jar', 'pdftagger.jar', pdf_file, json_file])

        host = config.get('mail', 'host')
        admin = config.get('mail', 'admin')

        logging.info('sending email to pm')
        send_mail(
            host=host,
            sender='NCIDOSEWebAdmin@mail.nih.gov',
            recipient=admin,
            subject='NCIDose STA Request',
            contents=pm_template.format(**data)
        )

        logging.info('sending email to investigator')
        send_mail(
            host=host,
            sender='NCIDOSEWebAdmin@mail.nih.gov',
            recipient=data['email'],
            subject='NCIDose Software Transfer Agreement Form',
            contents=recipient_template.format(**data),
            attachments=[pdf_file]
        )

        logging.info('deleting pii')
        os.remove(json_file)
        os.remove(pdf_file)

    except BaseException as e:
        logging.error(str(e))
        return str(e), 400

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
    message.attach(MIMEText(contents, 'html'))

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
    
    app.run(host='0.0.0.0', port=8765, debug=True)
