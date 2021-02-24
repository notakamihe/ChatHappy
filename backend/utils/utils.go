package utils

import (
	"encoding/json"
	"net/http"
	"strings"

	"go.mongodb.org/mongo-driver/mongo"
)

func ResponseWStatus(w http.ResponseWriter, status int, res string) {
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(res)
}

func DupCode(err error) int {
	var e mongo.WriteException
	e = err.(mongo.WriteException)

	for _, we := range e.WriteErrors {
		if we.Code == 11000 {
			if strings.Contains(we.Message, `username_1 dup key`) {
				return 0
			} else if strings.Contains(we.Message, `email_1 dup key`) {
				return 1
			}
		}
	}

	return -1
}
