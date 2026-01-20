FROM golang:1.21-alpine

WORKDIR /app

RUN apk add --no-cache git

COPY . .
RUN go build -o server ./cmd/main

CMD ["./server"]
