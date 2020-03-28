import socket
import struct
import sys
import json
import os

HOST = '127.0.0.1'  # Standard loopback interface address (localhost)
PORT = 10002        # Port to listen on (non-privileged ports are > 1023)
ServerDirectory = os.path.join(os.path.curdir,'ServerDummy')
recivingFile = False
sendingFile = False
f = None

if not os.path.exists(ServerDirectory):
    os.mkdir(ServerDirectory)

with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
	s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1) 
	s.bind((HOST,PORT))

	while True:
		if recivingFile:
			while True:
				data, address = s.recvfrom(65000)
				f.write(data)
				if len(data) < 65000:
					flnm = 0
					break
				s.sendto('continue'.encode(), address)
			f.close()
			recivingFile = False
			print("Done Receiving")
		elif sendingFile:
			data, address = s.recvfrom(65000)
			print(data.decode())
			chonk = f.read(65000)
			while chonk: 
				s.sendto(chonk, address)
				chonk = f.read(65000)
				data, address = s.recvfrom(65000)
			sendingFile = False
			f.close()
			print("Done Sending")
		else:
			print('\nwaiting to receive message')
			data, address = s.recvfrom(65000)
			try:
				data_in_json = json.loads(data)
				if data_in_json['file'] == True :
					thePath = os.path.join(ServerDirectory,data_in_json['mesg'])
					f = open(thePath, 'wb')
					print(ServerDirectory + data_in_json['mesg'], 'from: ', address)
					recivingFile = True
					s.sendto(('start_file_sending').encode(), address)
				else:
					thePath = os.path.join(ServerDirectory, os.path.basename(data_in_json['file']))
					f = open(thePath, 'rb')
					print('sending: ', thePath)
					s.sendto(('sending').encode(), address)
					sendingFile = True
			except Exception as e:
				print(e)
	s.close()
