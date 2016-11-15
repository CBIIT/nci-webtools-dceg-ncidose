import os
import re
import string
from flask import Flask, render_template, request, jsonify, make_response, send_from_directory
import json
import csv
import random
import subprocess
from weasyprint import HTML, CSS
from PropertyUtil import PropertyUtil
import urllib
import smtplib


# Load Env variables
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from twisted.internet import reactor, defer
from PropertyUtil import PropertyUtil
from stompest.async import Stomp
from stompest.async.listener import SubscriptionListener
from stompest.async.listener import DisconnectListener
from stompest.config import StompConfig
from stompest.protocol import StompSpec

app = Flask(__name__)
if not os.path.exists('tmp'):
    os.makedirs('tmp')

@app.route('/')
def index():
    return return_template('index.html')

@app.route('/ncidoseRest/', methods = ['POST'])
def store():
	mimetype = 'application/json'
	data = json.loads(request.stream.read())
	token_id=random.randrange(1, 1000000)
	email=data["email"]
	date=data["date"]
	page=data["page"].encode('utf-8').strip()
#	html_file = open("./content/NCI_STA_"+str(token_id)+".html", "w+")
#	html_file.write(page)
#	print(page)
#	subprocess.call(["weasyprint", "-s", "./css/agreement.css", 
#		("./content/NCI_STA_"+str(token_id)+".html"), 
#		("./content/NCI_STA_"+str(token_id)+".pdf")])
	file='./tmp/NCI_STA_'+str(token_id)+'.pdf';
	HTML(string=page).write_pdf('./tmp/NCI_STA_'+str(token_id)+'.pdf',
    	stylesheets=[CSS('./css/agreement.css')])
	print("sending to recipient")
	Send_to_recipient(email,file,date,data)
	print("sending to PM")
	Send_to_PM(data)
	return str("")

def Send_to_PM(data):
	config = PropertyUtil(r"config.ini")
	print(config)
	email=config.getAsString("mail.admin")
	rec_email=data['email']
	files=[]
	first = data["first"]
	last = data["last"]
	title = data["title"]
	purpose= data["purpose"]
	date=data["date"]
	phone=data["phone"]
	address=data["address"]
	institution=data["institution"]
	software_string=data["software"]
	page=data["page"].encode('utf-8').strip()
	product_name = "NCIDose"
	print "making message"

	header = """<h2>"""+product_name+"""</h2>"""
	body = """
	        <p>Dear Dr. Lee,</p>
	<span>This email is to let you know a user just visited the NCIDose web site and entered the following information on the Agreement page. A STA PDF has been generated and sent to the user via email. </span>
	<p><b><u>Materials to download</u></b></p>
	<ul>"""+software_string+"""</ul>
	<p><b><u>Recipient Investigator</u></b></p>
	<ul>
		<li>Name: """+first+""" """+last+"""</li>
		<li>Title: """+title+"""</li>
		<li>Email: """+rec_email+"""</li>
		<li>Phone: """+phone+"""</li>
		<li>Institution: """+institution+"""</li>
		<li>Buisness Address: """+address+"""</li>
	</ul>
	<p><b><u>Research Activity</u></b></p>
	<ul>
		<li>"""+purpose+"""</li>
	</ul>

	      """
	footer = """</br><p>Sincerely,</p><p>NCIDose Webtool</p>"""
	            
	message = """
	  <head>
	    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"> 
	    <title>html title</title>
	  </head>
	  <body>"""+body+footer+"""</body>""" 

	print "sending"
#	with open('./data/contacts.csv', 'a') as csvfile:
#		fieldnames = ['recipient_first_name', 'recipient_last_name','recipient_title','address','email','institution','investigator_first_name','investigator_last_name','investigator_title','purpose','date']
#		writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
#		writer.writerow({'recipient_first_name':first, 'recipient_last_name':last,'recipient_title':title,'address':address,'email':email,'institution':institution,'investigator_first_name':first_inv,'investigator_last_name':last_inv,'investigator_title':title_inv,'purpose':purpose,'date':date})
	composeMail(email,message,None,"NCIDose STA Request")

def Send_to_recipient(email,file,date,data):
	product_name = "NCIDose"
	print "making message"
	first = data["first"]
	last = data["last"]
	body = """
	      
	        Dear """+first+""" """+last+""",<br>
	        <p> Thank you for your interest in the materials and software for the new dosimetry methods and tools developed by the <a href="https://dceg.cancer.gov/"> Division of Cancer Epidemiology and Genetics.</a> Attached is the STA form pre-filled with the information you entered on the web site and the materials you want to download. Please review the STA form and email a signed copy to Dr. Choonsik Lee at leechoonsik@mail.nih.gov. You will be receiving an email with detailed download instructions once your email has been received and reviewed by Dr. Lee</p>
	      """
	footer = """
	      <div>
	        <p><i>
	          (Note:  : Please do not reply to this email. If you need assistance, please contact Dr. Choonsik Lee at leechoonsik@mail.nih.gov)
	        </p></i>
	       	</br><p>Sincerely,</p><p>NCIDose Webtool</p>

	            """
	message = """
	  <head>
	    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	    <title>html title</title>
	  </head>
	  <body>"""+body+footer+"""</body>"""

	print "sending"
#	with open('./data/contacts.csv', 'a') as csvfile:
#		fieldnames = ['recipient_first_name', 'recipient_last_name','recipient_title','address','email','institution','investigator_first_name','investigator_last_name','investigator_title','purpose','date']
#		writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
#		writer.writerow({'recipient_first_name':first, 'recipient_last_name':last,'recipient_title':title,'address':address,'email':email,'institution':institution,'investigator_first_name':first_inv,'investigator_last_name':last_inv,'investigator_title':title_inv,'purpose':purpose,'date':date})
	composeMail(email,message,file,"NCICT Software Transfer Agreement Form")

def composeMail(recipient,message,file,subject):
 	config = PropertyUtil(r"config.ini")
	recipient = recipient
	packet = MIMEMultipart()
	packet['Subject'] = subject
	packet['From'] = "NCIDose <do.not.reply@nih.gov>"
	packet['To'] = recipient
	packet.attach(MIMEText(message,'html'))
	if(file):
		with open(file,"rb") as openfile:
			packet.attach(MIMEApplication(
			  openfile.read(),
			  Content_Disposition='attachment; filename="%s"' % os.path.basename(file),
			  Name=os.path.basename(file)
		))
	MAIL_HOST=config.getAsString('mail.host')
	print MAIL_HOST
	smtp = smtplib.SMTP(MAIL_HOST)
	smtp.sendmail("do.not.reply@nih.gov",recipient,packet.as_string())
	print "sent email"

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response


if __name__ == "__main__":
  app.run(host = '0.0.0.0', port = 8765, debug = True)
