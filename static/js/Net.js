class Net {

    connectToDatabase(address) {
        return this.sendData("/api/connect/" + address, "GET");
    }

    getDatabases() {
        return this.sendData("/api/databases", "GET");
    }

    createDatabase(name) {
        return this.sendData("/api/databases", "POST", { name: name })
    }

    deleteDatabase(name) {
        return this.sendData("/api/databases/" + name, "DELETE");
    }

    getDatabaseCollections(databaseName) {
        return this.sendData("/api/databases/" + databaseName, "GET");
    }

    getCollection(name) {
        return this.sendData("/api/collections/" + name, "GET")
    }


    sendData(url, method, body) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                data: body ? JSON.stringify(body) : null,
                type: method,
                contentType: "application/json",
                success: function (data) {
                    resolve(data)
                },
                error: function (xhr, status, error) {
                    reject(xhr.responseText)
                },
            });
        })
    }
}