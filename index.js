const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const Expence = require('./model/expencemodel');
const AddMoney = require('./model/addmoney');

app.use(cors({
  origin: 'http://localhost:5173' // Correct origin
}));

const dbURI = 'mongodb://localhost:27017/moneymangment';

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use(express.json());

app.get('/', (req, res) => {
  res.send("hello Money World");
});

// Date formatting function
const formatDate = (date) => {
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
    res.status(500).send('Error adding money');
  }
});

app.get('/expencedata', async (req, res) => {
  try {
    const expenceDetails = await Expence.aggregate([
      {
        $group: {
          _id: "$createdAt",
          totalExpence: { $sum: { $toInt: "$amount" } }
        }
      },
      {
        $lookup: {
          from: "addmoneys", // Adjust the collection name as necessary
          localField: "_id",
          foreignField: "createdAt",
          as: "addmoney"
        }
      },
      {
        $unwind: {
          path: "$addmoney",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: "$_id",
          totalExpence: { $first: "$totalExpence" },
          totalAddMoney: { $sum: { $toInt: "$addmoney.amount" } }
        }
      },
      {
        $sort: { _id: 1 } // Sort by date
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          totalExpence: 1,
          totalAddMoney: 1
        }
      }
    ]);

    let previousBalance = 0;
    const result = expenceDetails.map((item) => {
      const newBalance = previousBalance + item.totalAddMoney - item.totalExpence;
      const newItem = {
        date: item.date,
        previousBalance,
        totalExpence: item.totalExpence,
        totalAddMoney: item.totalAddMoney,
        newBalance
      };
      previousBalance = newBalance;
      return newItem;
    });

    res.status(200).send(result);
  } catch (err) {
    res.status(500).send(err);
    console.error('Error retrieving expence data', err);
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
