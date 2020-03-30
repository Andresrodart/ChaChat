import socket
import sys

# Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Connect the socket to the port where the server is listening
server_address = ('localhost', 5000)
print('connecting to {} port {}'.format(*server_address))
sock.connect(server_address)

try:
	message = 'This is the message.  It will be repeated.'
	while message != 'exit':
		# Send data
		print('sending {!r}'.format(str.encode(message)))
		sock.sendall(str.encode(message))
		message = input()

    # Look for the response
    # amount_received = 0
    # amount_expected = len(message)

    # while amount_received < amount_expected:
    #     data = sock.recv(16)
    #     amount_received += len(data)
    #     print('received {!r}'.format(data))

finally:
    print('closing socket')
    sock.close()