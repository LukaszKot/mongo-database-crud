var net;
var choosenDatabase;
var choosenCollection;
$(document).ready(async () => {
    net = new Net();
    var address = prompt("Podaj ip bazy danych: ")
    var database = await net.connectToDatabase(address);
    if (address != database.server) {
        alert("Sorka. Ni ma takiej bazy. Połączono z localhost.");
    }
    $("#databaseName").html(database.server);

    var displayDatabases = async () => {
        $("#databases").empty();
        var databases = await net.getDatabases();
        databases.forEach(element => {
            $("#databases").append($("<div>").html(element).addClass("singleDatabase").on("click", async () => {
                var collections = await net.getDatabaseCollections(element);
                choosenDatabase = element;
                $("#collections").empty();
                collections.forEach(coll => {
                    $("#collections").append($("<div>").html(coll).addClass("singleCollection").on("click", async () => {
                        var collection = await net.getCollection(coll);
                        var string = JSON.stringify(collection);
                        $("#collection").val(string);
                    }))
                })
            }))
        });
    }
    displayDatabases();

    $("#addDatabase").on("click", async () => {
        var newDatabaseName = prompt("Podaj nazwę nowej bazy danych: ");
        await net.createDatabase(newDatabaseName);
        displayDatabases();
    })

    $("#removeDatabase").on("click", async () => {
        if (choosenDatabase == null) {
            alert("Nie wybrano bazy danych!!!");
            return;
        }
        await net.deleteDatabase(choosenDatabase);
        choosenDatabase = null;
        choosenCollection = null;
        displayDatabases();
        $("#collections").empty();
        $("#collection").val("");

    })

    $("#addCollection").on("click", async () => {
        if (choosenDatabase == null) {
            alert("Nie wybrano bazy danych!!!");
            return;
        }
    })

})