#include <string> 
#include <iostream> 
#include <unistd.h>
#include <stdlib.h> 
#include <pthread.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <netinet/in.h> 
#if !defined(True)
#define True  (1==1)
#endif
#if !defined(False)
#define False (!True)
#endif
#define PORT 5000

typedef struct{
	int sock;
	struct sockaddr address;
	socklen_t addr_len;
} connection_t;


void * worker(void * ptr);
void exitError(std::string error);
void handleConnection(connection_t * client);

int main(int argc, char const *argv[]) { 
	bool opt = True; 
	char buffer[1024] = {0}; 
	connection_t * connection;
	struct sockaddr_in address; 
	int server_fd, new_socket, valread, addrlen = sizeof(address);
	
	// Creating socket file descriptor for a socket of INtErneT Family, A TCP socket with default (0) protocol 
	if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == -1)
		exitError("socket failed");   
	// Make socket free port and addres after finishing work
	if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR | SO_REUSEPORT, &opt, sizeof(opt))) 
		exitError("setsockopt");
	/*	setup the host_addr structure for use in bind call
	// server byte order  */
	address.sin_family = AF_INET;
	// automatically be filled with current host's IP address (Address to accept any upcoming message)
	address.sin_addr.s_addr = inet_addr("127.0.0.1"); 
	// convert short integer value for port must be converted into network byte order
	address.sin_port = htons( PORT ); 
	   
	/*	
		bind() passes file descriptor, the address structure, 
		and the length of the address structure
		This bind() call will bind the socket to the current IP address on port, portno
	*/
	if (bind(server_fd, (struct sockaddr *)&address,sizeof(address)) == - 1) exitError("bind failed"); 
	/* 
		This listen() call tells the socket to listen to the incoming connections.
		listen() function places all incoming connection into a backlog queue
		until accept() call accepts the connection.
		Here, we set the maximum size for the backlog queue to 5.
	*/
	if (listen(server_fd, 50) == -1) exitError("listen");
	std::cout << "ChaChat server opened by " << inet_ntoa(address.sin_addr) << " on port " << PORT << std::endl;

	while (True){
		connection = (connection_t *)malloc(sizeof(connection_t));
		connection->sock = accept(server_fd, &connection->address, &connection->addr_len);
		if(connection->sock < 0) 
			free(connection);
		else 
			handleConnection(connection); 	// Handle the connection
	}
	return 0; 
} 

void exitError(std::string error){
	perror(error.c_str()); 
	exit(EXIT_FAILURE);
}

void handleConnection(connection_t * client) {
	pthread_t thread;
	pthread_create(&thread, 0, worker, client);
	pthread_detach(thread);
}

void * worker(void * ptr){
	connection_t * conn;
	char buffer[5000];
	size_t len = 1;
	
	if (!ptr) pthread_exit(0); 
	conn = (connection_t *)ptr;

	std::cout << inet_ntoa(((struct sockaddr_in *)&conn->address)->sin_addr) << ":" << ntohs(((struct sockaddr_in *)&conn->address)->sin_port) << " connected" << std::endl;

	/* read length of message */
	while (len > 0){
		/* read message */
		len = read(conn->sock, buffer, 5000);
		buffer[len] = '\0';
		/* print message */
		printf("%s\n", (len > 0)? buffer:"Disconected");
	}

	/* close socket and clean up */
	close(conn->sock);
	free(conn);
	pthread_exit(0);
}