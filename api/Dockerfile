FROM golang:1.21-alpine

WORKDIR /app

RUN apk add --no-cache git

COPY . .
RUN go build -mod=mod -o server ./cmd/main.go

CMD ["./server"]
