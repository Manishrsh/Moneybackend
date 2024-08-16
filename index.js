const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const Expence = require('./model/expencemodel');
const AddMoney = require('./model/addmoney');

app.use(cors({
  origin: '*' // Correct origin
}));

const dbURI = 'mongodb+srv://manishrs5235:z1vJjUxF4pOVBcIa@cluster0.mjowunr.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use(express.json());

app.get('/', (req, res) => {
  res.send("hello Money World cicd manish is done !!!!! only manish yes only add url");
});

// Date formatting function
const formatDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();
    
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    
    const formattedToday = dd + '/' + mm + '/' + yyyy;
  return formattedToday
};

app.post('/expence', async (req, res) => {
  const { amount, though } = req.body;
  const createdAts = formatDate();

  const expenceData = new Expence({
    amount,
    though,
    createdAt:createdAts
  });

  try {
    await expenceData.save();
    res.status(201).send('Expence saved successfully');
  } catch (err) {
    console.error('Error adding money:', err);
    res.status(500).send('Error saving expence');
  }
});

app.post('/addmoney', async (req, res) => {
  const { amount, though } = req.body;
  const createdAts = formatDate();

  const moneyAddData = new AddMoney({
    amount,
    though, 
    createdAt:createdAts
  });

  try {
    await moneyAddData.save();
    res.status(201).send('Money added successfully');
  } catch (err) {
    console.error('Error adding money:', err);
    res.status(500).send('Error adding money');
  }
});

app.get('/expencedata', async (req, res) => {
 try {
  const expenceDetails = await Expence.aggregate([
    {
      $group: {
        _id: "$createdAt", // Group by date
        totalExpence: { $sum: { $toInt: "$amount" } } // Sum expenses, converting amount to integer
      }
    },
    {
      $lookup: {
        from: "addmoneys", // The name of the collection to join with
        localField: "_id", // Field from the current collection (grouped date)
        foreignField: "createdAt", // Field from the foreign collection
        as: "addmoney" // Name of the new field to add the results
      }
    },
    {
      $unwind: {
        path: "$addmoney", // Deconstruct the array to output a document for each element
        preserveNullAndEmptyArrays: true // Keep documents with no matching entries
      }
    },
    {
      $group: {
        _id: "$_id", // Re-group by date
        totalExpence: { $first: "$totalExpence" }, // Get the total expense
        totalAddMoney: { $sum: { $toInt: "$addmoney.amount" } } // Sum the add money amounts
      }
    },
    {
      $sort: { _id: 1 } // Sort by date in ascending order
    },
    {
      $project: {
        _id: 0, // Exclude _id from the output
        date: "$_id", // Rename _id to date
        totalExpence: 1,
        totalAddMoney: 1
      }
    }
  ]);

  let previousBalance = 1500; // Starting balance
  const result = expenceDetails.map((item) => {
    const newBalance = previousBalance + item.totalAddMoney - item.totalExpence; // Calculate new balance
    const newItem = {
      date: item.date,
      previousBalance,
      totalExpence: item.totalExpence,
      totalAddMoney: item.totalAddMoney,
      newBalance
    };
    previousBalance = newBalance; // Update previous balance for next iteration
    return newItem;
  });

  res.status(200).send(result); // Send the final result to the client
} catch (error) {
  res.status(500).send({ error: 'An error occurred while processing your request.' });
}

});
    
app.get('/expencedataall',async(req,res)=>{
    const expenceData = await Expence.find()
    res.status(200).send(expenceData)
})
app.get('/expencedatadateformat',async(req,res)=>{
    try {
        console.log('calledformat');
        const { date } = req.query;
        const formattedDate = date;
        console.log(formattedDate);
    
        const expenceData = await Expence.find({
          createdAt: formattedDate
        });
        console.log()
    
        res.status(200).send(expenceData);
      } catch (err) {
        res.status(500).send(err.message);
        console.error('Error retrieving data', err);
      }
})


app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
