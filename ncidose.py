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
	
	Send_to_recipient(email,file,date)
	Send_to_PM(data)
	return str("")

def Send_to_PM(data):
	config = PropertyUtil(r"config.ini")
	print(config)
	email=config.getAsString("mail.admin")
	
	files=[]
	first = data["first"]
	last = data["last"]
	title = data["title"]
	purpose= data["purpose"]
	date=data["date"]
	address=data["address"]
	institution=data["institution"]
	software=data["software"]
	page=data["page"].encode('utf-8').strip()
	product_name = "NCIDose"
	print "making message"

	header = """<h2>"""+product_name+"""</h2>"""
	body = """
	      <div style="background-color:white;border-top:25px solid #142830;border-left:2px solid #142830;border-right:2px solid #142830;border-bottom:2px solid #142830;padding:20px">
	        <p>Dr. Lee,</p></br>
	A user has submitted a request using the using the """+product_name+"""  web application tool on """+date+""". The details are as follows:</p>
	<p> Recipient name: """+first+""" """+last+"""</p>
	<p>Recipient title: """+title+"""</p>
	<p>Recipient email: """+email+"""</p>
	<p>Institution: """+institution+"""</p>
	<p> Buisness Address: """+address+"""</p></br>
	<p> Software request: """+software+"""</p></br>
	<p> Purpose of request: """+purpose+"""</p></br>

	      """
	footer = """
	      <div>
	        <p>
	          (Note:  Please do not reply to this email. If you need assistance, please contact xxxxx@mail.nih.gov)
	        </p>
	      </div>

	        <div style="background-color:#ffffff;color:#888888;font-size:13px;line-height:17px;font-family:sans-serif;text-align:left">
	              <p>
	                  <strong>About <em>"""+product_name+"""</em></strong></em><br>
	                  To support epidemiological studies of radiation exposure but also to advance the science of radiation exposure assessment, Dosimetry Unit within the Radiation Epidemiology Branch, Division of Cancer Epidemiology and Genetics, National Cancer Institute develops new dosimetry methods and tools for medical, occupational and environmental radiation exposure scenarios. This website is designed to share the major developments in dose assessment tools and resources with other researchers. 
	                  <strong>For more information, visit
	                    <a target="_blank" style="color:#888888" href="http://analysistools.nci.nih.gov">analysistools.nci.nih.gov/jpsurv</a>
	                  </strong>
	              </p>
	              <p style="font-size:11px;color:#b0b0b0">If you did not request a calculation please ignore this email.
	Your privacy is important to us.  Please review our <a target="_blank" style="color:#b0b0b0" href="http://www.cancer.gov/policies/privacy-security">Privacy and Security Policy</a>.
	</p>
	              <p align="center"><a href="http://cancercontrol.cancer.gov/">Division of Cancer Control & Population Sciences</a>, 
	              <span style="white-space:nowrap">a Division of <a href="www.cancer.gov">National Cancer Institute</a></span><br>
	              BG 9609 MSC 9760 | 9609 Medical Center Drive | Bethesda, MD 20892-9760 | <span style="white-space:nowrap"><a target="_blank" value="+18004006916" href="tel:1-800-422-6237">1-800-4-CANCER</a></span>
	              </p>
	            </div>
	            """
	message = """
	  <head>
	    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"> 
	    <title>html title</title>
	  </head>
	  <body>"""+header+body+footer+"""</body>""" 

	print "sending"
#	with open('./data/contacts.csv', 'a') as csvfile:
#		fieldnames = ['recipient_first_name', 'recipient_last_name','recipient_title','address','email','institution','investigator_first_name','investigator_last_name','investigator_title','purpose','date']
#		writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
#		writer.writerow({'recipient_first_name':first, 'recipient_last_name':last,'recipient_title':title,'address':address,'email':email,'institution':institution,'investigator_first_name':first_inv,'investigator_last_name':last_inv,'investigator_title':title_inv,'purpose':purpose,'date':date})
	composeMail(email,message,None)

def Send_to_recipient(email,file,date):
	product_name = "NCIDose"
	print "making message"

	header = """<h2>"""+product_name+"""</h2>"""
	body = """
	      <div style="background-color:white;border-top:25px solid #142830;border-left:2px solid #142830;border-right:2px solid #142830;border-bottom:2px solid #142830;padding:20px">
	        Hello,<br>
	        <p> On """+date+""" using the """+product_name+""" web application tool, you requested to use new various dosimetry methods, tools, and dose coefficients. Attatched is the STA document outlining which of those tools you will like to have access to. Please review the PDF document and email back to Dr. Lee at leechoonsik@mail.nih.gov</p>

	      """
	footer = """
	      <div>
	        <p>
	          (Note:  Please do not reply to this email. If you need assistance, please contact xxxxx@mail.nih.gov)
	        </p>
	      </div>

	        <div style="background-color:#ffffff;color:#888888;font-size:13px;line-height:17px;font-family:sans-serif;text-align:left">
	              <p>
	                  <strong>About <em>"""+product_name+"""</em></strong></em><br>
	                  To support epidemiological studies of radiation exposure but also to advance the science of radiation exposure assessment, Dosimetry Unit within the Radiation Epidemiology Branch, Division of Cancer Epidemiology and Genetics, National Cancer Institute develops new dosimetry methods and tools for medical, occupational and environmental radiation exposure scenarios. This website is designed to share the major developments in dose assessment tools and resources with other researchers. 
	                  <strong>For more information, visit
	                    <a target="_blank" style="color:#888888" href="http://analysistools.nci.nih.gov">analysistools.nci.nih.gov/jpsurv</a>
	                  </strong>
	              </p>
	              <p style="font-size:11px;color:#b0b0b0">If you did not request a calculation please ignore this email.
	Your privacy is important to us.  Please review our <a target="_blank" style="color:#b0b0b0" href="http://www.cancer.gov/policies/privacy-security">Privacy and Security Policy</a>.
	</p>
	              <p align="center"><a href="http://cancercontrol.cancer.gov/">Division of Cancer Control & Population Sciences</a>, 
	              <span style="white-space:nowrap">a Division of <a href="www.cancer.gov">National Cancer Institute</a></span><br>
	              BG 9609 MSC 9760 | 9609 Medical Center Drive | Bethesda, MD 20892-9760 | <span style="white-space:nowrap"><a target="_blank" value="+18004006916" href="tel:1-800-422-6237">1-800-4-CANCER</a></span>
	              </p>
	            </div>
	            """
	message = """
	  <head>
	    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	    <title>html title</title>
	  </head>
	  <body>"""+header+body+footer+"""</body>"""

	print "sending"
#	with open('./data/contacts.csv', 'a') as csvfile:
#		fieldnames = ['recipient_first_name', 'recipient_last_name','recipient_title','address','email','institution','investigator_first_name','investigator_last_name','investigator_title','purpose','date']
#		writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
#		writer.writerow({'recipient_first_name':first, 'recipient_last_name':last,'recipient_title':title,'address':address,'email':email,'institution':institution,'investigator_first_name':first_inv,'investigator_last_name':last_inv,'investigator_title':title_inv,'purpose':purpose,'date':date})
	composeMail(email,message,file)

def composeMail(recipient,message,file):
 	config = PropertyUtil(r"config.ini")
	recipient = recipient
	packet = MIMEMultipart()
	packet['Subject'] = "NCIDose STA Request Form"
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
