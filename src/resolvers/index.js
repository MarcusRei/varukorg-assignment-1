const path = require("path");
const fsPromises = require("fs/promises");
const {
  fileExists,
  readJsonFile,
  deleteFile,
  getDirectoryFileNames,
} = require("../utils/fileHandling");
const { GraphQLError, printType } = require("graphql");
const crypto = require("crypto");
//const axios = require("axios").default;

const usercartDirectory = path.join(__dirname, "..", "data", "usercarts");
const itemDirectory = path.join(__dirname, "..", "data", "items");

//Mockdata
/* const basketball = {
  id: "7b30fcf5-06cb-4f3c-b61e-b560e3476c5b",
  name: "Basketball",
  itemprice: 150,
};

const football = {
  id: "4c7af0ef-af7f-4647-ad77-ee5b90cf9bcf",
  name: "Football",
  itemprice: 100,
};

const tennisball = {
  id: "6cc538fa-c247-4779-8378-6a9a02fc200c",
  name: "Tennisball",
  itemprice: 50,
}; */

exports.resolvers = {
  Query: {
    getUsercartById: async (_, args) => {
      const usercartId = args.usercartId;

      const usercartFilePath = path.join(
        usercartDirectory,
        `${usercartId}.json`
      );

      const usercartExists = await fileExists(usercartFilePath);

      if (!usercartExists)
        return new GraphQLError("Den här varukorgen finns inte!");

      const usercartData = await fsPromises.readFile(usercartFilePath, {
        encoding: "utf-8",
      });

      const data = JSON.parse(usercartData);

      return data;
    },
    getAllUsercarts: async (_, args) => {
      const usercarts = await getDirectoryFileNames(usercartDirectory);

      const usercartData = [];

      for (const file of usercarts) {
        const filePath = path.join(usercartDirectory, file);

        const fileContents = await fsPromises.readFile(filePath, {
          encoding: "utf-8",
        });

        const data = JSON.parse(fileContents);

        usercartData.push(data);
      }

      return usercartData;
    },
  },
  Mutation: {
    createUsercart: async (_, args) => {
      const items = [];

      let price = 0;
      for (let i = 0; i < items.length; i++) {
        price += items[i].itemprice;
      }

      //Skapa unikt id
      const newUsercart = {
        id: crypto.randomUUID(),
        amountOfItems: items.length,
        items: items,
        totalPrice: price,
      };

      //Skapa filePath
      let filePath = path.join(usercartDirectory, `${newUsercart.id}.json`);

      let idExists = true;
      while (idExists === true) {
        const exists = await fileExists(filePath);
        console.log(exists, newUsercart.id);

        if (exists === true) {
          newUsercart.id = crypto.randomUUID();
          filePath = path.join(usercartDirectory, `${newUsercart.id}.json`);
        }

        idExists = exists;
      }

      await fsPromises.writeFile(filePath, JSON.stringify(newUsercart));

      return newUsercart;

      //return null;
    },
    addItemToUsercart: async (_, args) => {
      const { usercartId, chosenItem } = args.input;

      //filepath usercart
      const usercartFilePath = path.join(
        usercartDirectory,
        `${usercartId}.json`
      );

      //Existence check
      const usercartExists = await fileExists(usercartFilePath);
      if (!usercartExists) {
        return new GraphQLError("Den här varukorgen finns inte!");
      }

      //Read the usercart (still in JSON)
      const usercartJSON = await fsPromises.readFile(usercartFilePath, {
        encoding: "utf-8",
      });

      const usercartData = JSON.parse(usercartJSON);

      //get list of items
      const listOfitems = await getDirectoryFileNames(itemDirectory);

      availableItems = [];
      const items = usercartData.items;

      //loop through, parse and add to available items
      for (const file of listOfitems) {
        const ItemfilePath = path.join(itemDirectory, file);

        const fileContents = await fsPromises.readFile(ItemfilePath, {
          encoding: "utf-8",
        });

        const data = JSON.parse(fileContents);

        availableItems.push(data);
      }

      console.log(availableItems);

      for (let i = 0; i < availableItems.length; i++) {
        if (args.input.chosenItem === "FOOTBALL") {
          usercartData.items.push(availableItems[i]);
          console.log(usercartData.items);
        } else {
          if (args.input.chosenItem === "BASKETBALL") {
            usercartData.items.push(availableItems[i]);
            console.log(usercartData.items);
          } else {
            if (args.input.chosenItem === "TENNISBALL") {
              usercartData.items.push(availableItems[i]);
              console.log(usercartData.items);
            } else {
              if (args.input.chosenItem === "HOCKEYPUCK") {
                usercartData.items.push(availableItems[i]);
                console.log(usercartData.items);
              } else {
                if (args.input.chosenItem === "SHUTTERCOCK") {
                  usercartData.items.push(availableItems[i]);
                  console.log(usercartData.items);
                }
              }
            }
          }
        }
      }

      console.log(usercartData);
      //Calculate price
      let price = 0;
      for (let i = 0; i < usercartData.items.length; i++) {
        price += usercartData.items[i].itemprice;
      }

      //Create updated object
      const updatedUsercart = {
        id: usercartData.id,
        amountOfItems: usercartData.items.length,
        items: usercartData.items,
        totalPrice: price,
      };

      //Overwrite file
      await fsPromises.writeFile(
        usercartFilePath,
        JSON.stringify(updatedUsercart)
      );

      //return updatedUsercart;
      return updatedUsercart;
    },
    removeItemFromUsercart: async (_, args) => {
      return null;
    },
    deleteUsercart: async (_, args) => {
      //Get the ID
      const usercartId = args.usercartId;

      const filePath = path.join(usercartDirectory, `${usercartId}.json`);

      //Kolla att ID:et finns
      const usercartExists = await fileExists(filePath);
      if (!usercartExists) {
        return new GraphQLError("Den här varukorgen finns inte");
      }

      //Delete file
      try {
        await deleteFile(filePath);
      } catch (error) {
        return {
          deletedId: usercartId,
          success: false,
        };
      }

      return {
        deletedId: usercartId,
        success: true,
      };
    },
  },
};

//itemsData
/* [
  {
    id: '4c7af0ef-af7f-4647-ad77-ee5b90cf9bcf', 
    name: 'Football',
    itemprice: 100
  },
  {
    id: '6cc538fa-c247-4779-8378-6a9a02fc200c', 
    name: 'Tennisball',
    itemprice: 50
  },
  {
    id: '744fc6755-3189-4ae6-a5d1-bfc5a450a730',
    name: 'Shuttercock',
    itemprice: 40
  },
  {
    id: '7b30fcf5-06cb-4f3c-b61e-b560e3476c5b', 
    name: 'Basketball',
    itemprice: 150
  },
  {
    id: 'f7dc9d36-0be5-47eb-b57e-1f5bbc335b3c', 
    name: 'Hockeypuck',
    itemprice: 70
  }
] */
