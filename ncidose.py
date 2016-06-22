import os
import re
import string
from flask import Flask, render_template, request, jsonify, make_response, send_from_directory
import json
import csv
import random
import subprocess
from weasyprint import HTML, CSS

# Load Env variables


app = Flask(__name__)

@app.route('/')
def index():
    return return_template('index.html')

@app.route('/ncidoseRest/', methods = ['POST'])
def store():
	mimetype='application/json'
	data = json.loads(request.stream.read())
	first = data["first"]
	last = data["last"]
	title = data["title"]
	email= data["email"]
	institution= data["institution"]
	first_inv= data["first_inv"]
	last_inv= data["last_inv"]
	title_inv= data["title_inv"]
	purpose= data["purpose"]
	date=data["date"]
	address=data["address"]
	page=data["page"].encode('utf-8').strip()
 	address='"%s"'%address
 	purpose='"%s"'%purpose
	token_id=random.randrange(1, 1000000)
#	html_file = open("./content/NCI_STA_"+str(token_id)+".html", "w+")
#	html_file.write(page)
#	print(page)
#	subprocess.call(["weasyprint", "-s", "./css/agreement.css", 
#		("./content/NCI_STA_"+str(token_id)+".html"), 
#		("./content/NCI_STA_"+str(token_id)+".pdf")])
	HTML(string=page).write_pdf('./content/NCI_STA_'+str(token_id)+'.pdf',
    	stylesheets=[CSS('./css/agreement.css')])
	
	with open('./content/contacts.csv', 'a') as csvfile:
		fieldnames = ['recipient_first_name', 'recipient_last_name','recipient_title','address','email','institution','investigator_first_name','investigator_last_name','investigator_title','purpose','date']
		writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
		writer.writerow({'recipient_first_name':first, 'recipient_last_name':last,'recipient_title':title,'address':address,'email':email,'institution':institution,'investigator_first_name':first_inv,'investigator_last_name':last_inv,'investigator_title':title_inv,'purpose':purpose,'date':date})
	return str(token_id)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response


if __name__ == "__main__":
  app.run(host = '0.0.0.0', port = 8200, debug = True)
