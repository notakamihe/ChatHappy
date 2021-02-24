package routes

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"time"
	"unicode"

	"github.com/gorilla/mux"
	"github.com/notakamihe/ChatHappy/backend/models"
	"github.com/notakamihe/ChatHappy/backend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

var UserCollection *mongo.Collection
var ConversationCollection *mongo.Collection
var MessageCollection *mongo.Collection

func NewRouter() *mux.Router {
	router := mux.NewRouter()

	router.HandleFunc("/signup", signUp).Methods("POST")
	router.HandleFunc("/login", logIn).Methods("POST")

	router.HandleFunc("/users", getUsers).Methods("GET")
	router.HandleFunc("/users/{id}", getUser).Methods("GET")
	router.HandleFunc("/users/{id}", updateUser).Methods("PUT")
	router.HandleFunc("/users/{id}", deleteUser).Methods("DELETE")

	router.HandleFunc("/conversations", getConversations).Methods("GET")
	router.HandleFunc("/conversations", createConversation).Methods("POST")
	router.HandleFunc("/conversations/{id}", getConversation).Methods("GET")
	router.HandleFunc("/conversations/{id}", updateConversation).Methods("PUT")
	router.HandleFunc("/conversations/{id}", deleteConversation).Methods("DELETE")

	router.HandleFunc("/messages", getMessages).Methods("GET")
	router.HandleFunc("/messages", createMessage).Methods("POST")
	router.HandleFunc("/messages/{id}", getMessage).Methods("GET")
	router.HandleFunc("/messages/{id}", deleteMessage).Methods("DELETE")

	return router
}

func signUp(w http.ResponseWriter, r *http.Request) {
	var user models.User

	json.NewDecoder(r.Body).Decode(&user)

	if user.Username == "" {
		utils.ResponseWStatus(w, http.StatusBadRequest, "Username is missing")
		return
	} else {
		if len(user.Username) > 30 {
			utils.ResponseWStatus(w, http.StatusBadRequest, "No more than thirty characters for the user")
			return
		}

		for _, letter := range user.Username {
			if !(unicode.IsLetter(letter) || unicode.IsDigit(letter) || string(letter) == "_") {
				utils.ResponseWStatus(w, http.StatusBadRequest, "Username is not valid. Only letter, digits and underscores allowed")
				return
			}
		}
	}

	if user.Email == "" {
		utils.ResponseWStatus(w, http.StatusBadRequest, "Email is missing")
		return
	}

	if user.Dob == "" {
		utils.ResponseWStatus(w, http.StatusBadRequest, "Dob is missing")
		return
	} else {
		matched, err := regexp.Match(`^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])`, []byte(user.Dob))

		if err != nil || !matched {
			utils.ResponseWStatus(w, http.StatusBadRequest, "Invalid date format")
			return
		}
	}

	if user.Password == "" {
		utils.ResponseWStatus(w, http.StatusBadRequest, "Password is missing")
		return
	} else if len(user.Password) < 8 {
		utils.ResponseWStatus(w, http.StatusBadRequest, "Password must have at least 8 characters.")
		return
	}

	if user.Friends == nil {
		utils.ResponseWStatus(w, http.StatusBadRequest, "List of friends is missing")
		return
	}

	user.ID = primitive.NewObjectID()

	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), 10)

	if err != nil {
		log.Fatal(err)
	}

	user.Password = string(hash)

	insertResult, err := UserCollection.InsertOne(context.TODO(), &user)

	if err != nil {
		if utils.DupCode(err) == 0 {
			utils.ResponseWStatus(w, http.StatusBadRequest, "Username is not available")
			return
		} else if utils.DupCode(err) == 1 {
			utils.ResponseWStatus(w, http.StatusBadRequest, "Email is not available")
			return
		}

		log.Fatal(err)
	}

	user.Password = ""
	fmt.Println(insertResult.InsertedID)
	json.NewEncoder(w).Encode(user)
}

func logIn(w http.ResponseWriter, r *http.Request) {
	var user models.User

	json.NewDecoder(r.Body).Decode(&user)

	if user.Username == "" {
		utils.ResponseWStatus(w, http.StatusBadRequest, "Username is missing")
		return
	}

	if user.Password == "" {
		utils.ResponseWStatus(w, http.StatusBadRequest, "Password is missing")
		return
	} else if len(user.Password) < 8 {
		utils.ResponseWStatus(w, http.StatusBadRequest, "Password must have at least 8 characters")
		return
	}

	password := user.Password

	err := UserCollection.FindOne(context.TODO(), bson.M{"username": user.Username}).Decode(&user)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.ResponseWStatus(w, http.StatusBadRequest, "User with this username does not exist.")
			return
		}

		log.Fatal(err)
	}

	hashedPassword := user.Password

	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))

	if err != nil {
		utils.ResponseWStatus(w, http.StatusUnauthorized, "Password is incorrect.")
		return
	}

	user.Password = ""

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}

func getUsers(w http.ResponseWriter, r *http.Request) {
	var users []models.User

	result, err := UserCollection.Find(context.TODO(), bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	for result.Next(context.TODO()) {
		var user models.User
		err := result.Decode(&user)

		if err != nil {
			log.Fatal(err)
		}

		users = append(users, user)
	}

	json.NewEncoder(w).Encode(users)
}

func getUser(w http.ResponseWriter, r *http.Request) {
	var params = mux.Vars(r)

	var user models.User

	id, _ := primitive.ObjectIDFromHex(params["id"])

	err := UserCollection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&user)

	if err != nil {
		utils.ResponseWStatus(w, http.StatusBadRequest, "User not found.")
		return
	}

	user.Password = ""
	json.NewEncoder(w).Encode(user)
}

func updateUser(w http.ResponseWriter, r *http.Request) {
	var params = mux.Vars(r)
	var user models.User

	id, _ := primitive.ObjectIDFromHex(params["id"])

	_ = json.NewDecoder(r.Body).Decode(&user)

	if user.Username == "" {
		utils.ResponseWStatus(w, http.StatusBadRequest, "Username is missing")
		return
	} else {
		if len(user.Username) > 30 {
			utils.ResponseWStatus(w, http.StatusBadRequest, "No more than thirty characters for the user")
			return
		}

		for _, letter := range user.Username {
			if !(unicode.IsLetter(letter) || unicode.IsDigit(letter) || string(letter) == "_") {
				utils.ResponseWStatus(w, http.StatusBadRequest, "Username is not valid. Only letter, digits and underscores allowed")
				return
			}
		}
	}

	if user.Email == "" {
		utils.ResponseWStatus(w, http.StatusBadRequest, "Email is missing")
		return
	}

	if user.Dob == "" {
		utils.ResponseWStatus(w, http.StatusBadRequest, "Dob is missing")
		return
	} else {
		matched, err := regexp.Match(`^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])`, []byte(user.Dob))

		if err != nil || !matched {
			utils.ResponseWStatus(w, http.StatusBadRequest, "Invalid date format")
			return
		}
	}

	if user.Friends == nil {
		utils.ResponseWStatus(w, http.StatusBadRequest, "List of friends is missing")
		return
	}

	update := bson.M{
		"$set": bson.M{
			"username": user.Username,
			"email":    user.Email,
			"dob":      user.Dob,
			"friends":  user.Friends,
		}}

	updateResult, err := UserCollection.UpdateOne(context.TODO(), bson.M{"_id": id}, update)

	if err != nil {
		if utils.DupCode(err) == 0 {
			utils.ResponseWStatus(w, http.StatusBadRequest, "Username is not available")
			return
		} else if utils.DupCode(err) == 1 {
			utils.ResponseWStatus(w, http.StatusBadRequest, "Email is not available")
			return
		}
	} else if updateResult.MatchedCount <= 0 {
		utils.ResponseWStatus(w, http.StatusBadRequest, "User not found.")
		return
	}

	user.ID = id
	json.NewEncoder(w).Encode(user)
}

func deleteUser(w http.ResponseWriter, r *http.Request) {
	var params = mux.Vars(r)

	id, _ := primitive.ObjectIDFromHex(params["id"])

	deletedResult, err := UserCollection.DeleteOne(context.TODO(), bson.M{"_id": id})

	if deletedResult.DeletedCount <= 0 || err != nil {
		utils.ResponseWStatus(w, http.StatusBadRequest, "User not found.")
		return
	}

	json.NewEncoder(w).Encode("Deleted user successfully")
}

func getConversations(w http.ResponseWriter, r *http.Request) {
	var conversations []models.Conversation

	result, err := ConversationCollection.Find(context.TODO(), bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	for result.Next(context.TODO()) {
		var conversation models.Conversation
		err := result.Decode(&conversation)

		if err != nil {
			log.Fatal(err)
		}

		conversations = append(conversations, conversation)
	}

	json.NewEncoder(w).Encode(conversations)
}

func getConversation(w http.ResponseWriter, r *http.Request) {
	var params = mux.Vars(r)

	var conversation models.Conversation

	id, _ := primitive.ObjectIDFromHex(params["id"])

	err := ConversationCollection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&conversation)

	if err != nil {
		utils.ResponseWStatus(w, http.StatusBadRequest, "Conversation not found.")
		return
	}

	json.NewEncoder(w).Encode(conversation)
}

func createConversation(w http.ResponseWriter, r *http.Request) {
	var conversation models.Conversation

	json.NewDecoder(r.Body).Decode(&conversation)

	if conversation.Messages == nil {
		utils.ResponseWStatus(w, http.StatusBadRequest, "List of messages is missing")
		return
	}

	if conversation.Users == nil {
		utils.ResponseWStatus(w, http.StatusBadRequest, "List of users is missing")
		return
	} else if len(conversation.Users) < 2 {
		utils.ResponseWStatus(w, http.StatusBadRequest, "At least two users are needed for a conversation.")
		return
	}

	conversation.ID = primitive.NewObjectID()

	_, err := ConversationCollection.InsertOne(context.TODO(), &conversation)

	if err != nil {
		log.Fatal(err)
	}

	json.NewEncoder(w).Encode(conversation)
}

func updateConversation(w http.ResponseWriter, r *http.Request) {
	var params = mux.Vars(r)
	var conversation models.Conversation

	id, _ := primitive.ObjectIDFromHex(params["id"])

	_ = json.NewDecoder(r.Body).Decode(&conversation)

	if conversation.Messages == nil {
		utils.ResponseWStatus(w, http.StatusBadRequest, "List of messages is missing")
		return
	}

	if conversation.Users == nil {
		utils.ResponseWStatus(w, http.StatusBadRequest, "List of users is missing")
		return
	} else if len(conversation.Users) < 2 {
		utils.ResponseWStatus(w, http.StatusBadRequest, "At least two users are needed for a conversation.")
		return
	}

	update := bson.M{
		"$set": bson.M{
			"messages": conversation.Messages,
			"users":    conversation.Users,
		}}

	updateResult, err := ConversationCollection.UpdateOne(context.TODO(), bson.M{"_id": id}, update)

	if updateResult.MatchedCount <= 0 || err != nil {
		utils.ResponseWStatus(w, http.StatusBadRequest, "Conversation not found.")
		return
	}

	conversation.ID = id
	json.NewEncoder(w).Encode(conversation)
}

func deleteConversation(w http.ResponseWriter, r *http.Request) {
	var params = mux.Vars(r)

	id, _ := primitive.ObjectIDFromHex(params["id"])

	deletedResult, err := ConversationCollection.DeleteOne(context.TODO(), bson.M{"_id": id})

	if deletedResult.DeletedCount <= 0 || err != nil {
		utils.ResponseWStatus(w, http.StatusBadRequest, "Conversation not found.")
		return
	}

	json.NewEncoder(w).Encode("Deleted conversation successfully")
}

func getMessages(w http.ResponseWriter, r *http.Request) {
	var messages []models.Message

	result, err := MessageCollection.Find(context.TODO(), bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	for result.Next(context.TODO()) {
		var message models.Message
		err := result.Decode(&message)

		if err != nil {
			log.Fatal(err)
		}

		messages = append(messages, message)
	}

	json.NewEncoder(w).Encode(messages)
}

func getMessage(w http.ResponseWriter, r *http.Request) {
	var params = mux.Vars(r)

	var message models.Message

	id, _ := primitive.ObjectIDFromHex(params["id"])

	err := MessageCollection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&message)

	if err != nil {
		utils.ResponseWStatus(w, http.StatusBadRequest, "Message not found.")
		return
	}

	json.NewEncoder(w).Encode(message)
}

func createMessage(w http.ResponseWriter, r *http.Request) {
	var message models.Message
	defaultId, _ := primitive.ObjectIDFromHex("000000000000000000000000")

	json.NewDecoder(r.Body).Decode(&message)

	if message.Content == "" {
		utils.ResponseWStatus(w, http.StatusBadRequest, "Message content cannot be blank.")
		return
	}

	if message.SentBy == defaultId {
		utils.ResponseWStatus(w, http.StatusBadRequest, "Sender is missing")
		return
	} else {
		err := UserCollection.FindOne(context.TODO(), bson.M{"_id": message.SentBy}).Decode(&message)

		if err != nil {
			utils.ResponseWStatus(w, http.StatusBadRequest, "Sender not found.")
			return
		}
	}

	message.ID = primitive.NewObjectID()
	message.CreatedAt = time.Now()

	_, err := MessageCollection.InsertOne(context.TODO(), &message)

	if err != nil {
		log.Fatal(err)
	}

	json.NewEncoder(w).Encode(message)
}

func deleteMessage(w http.ResponseWriter, r *http.Request) {
	var params = mux.Vars(r)

	id, _ := primitive.ObjectIDFromHex(params["id"])

	deletedResult, err := MessageCollection.DeleteOne(context.TODO(), bson.M{"_id": id})

	if deletedResult.DeletedCount <= 0 || err != nil {
		utils.ResponseWStatus(w, http.StatusBadRequest, "Message not found.")
		return
	}

	json.NewEncoder(w).Encode("Deleted message successfully")
}
