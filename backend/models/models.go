package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID       primitive.ObjectID   `json:"_id" bson:"_id"`
	Username string               `json:"username"`
	Email    string               `json:"email"`
	Dob      string               `json:"dob"`
	Password string               `json:"password"`
	Friends  []primitive.ObjectID `json:"friends"`
}

type Message struct {
	ID        primitive.ObjectID `json:"_id" bson:"_id"`
	Content   string             `json:"content"`
	CreatedAt time.Time          `json:"createdat"`
	SentBy    primitive.ObjectID `json:"sentby"`
}

type Conversation struct {
	ID       primitive.ObjectID   `json:"_id" bson:"_id"`
	Messages []primitive.ObjectID `json:"messages"`
	Users    []primitive.ObjectID `json:"users"`
}
