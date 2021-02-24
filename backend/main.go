package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/handlers"
	"github.com/notakamihe/ChatHappy/backend/routes"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	os.Setenv("ATLAS_URI", "mongodb+srv://notak:Akamihe2004!@cluster0.s1zlw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")

	uri := os.Getenv("ATLAS_URI")

	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(context.TODO(), clientOptions)

	if err != nil {
		log.Fatal(err)
	}

	routes.UserCollection = client.Database("myFirstDatabase").Collection("users")
	routes.ConversationCollection = client.Database("myFirstDatabase").Collection("conversations")
	routes.MessageCollection = client.Database("myFirstDatabase").Collection("messages")

	r := routes.NewRouter()

	headers := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
	methods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE"})
	origins := handlers.AllowedOrigins([]string{"*"})

	port := os.Getenv("PORT")
	fmt.Println("Connected successfully to DB")
	fmt.Println("Server started on port " + port)
	log.Fatal(http.ListenAndServe(":"+port, handlers.CORS(headers, methods, origins)(r)))
}
