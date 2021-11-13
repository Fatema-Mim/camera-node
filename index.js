const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cqu9q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);

async function run() {
    try {
        await client.connect();
        console.log('ok');
        const database = client.db('locked_time');
        const orderCollection = database.collection('orders');
        const productCollection = database.collection('products');
        const reviewCollection = database.collection('reviews');
        const userCollection = database.collection('users');


        // GET API
        app.get('/productAdd', async (req, res) => {
            const cursor = productCollection.find({});
            const product = await cursor.toArray();
            console.log('ok done')
            res.send(product);
        })

        // POST API
        app.post('/productAdd', async (req, res) => {
            const newUser = req.body;
            const result = await productCollection.insertOne(newUser);

            console.log('hitting the post', result);
            res.json(result);
        })
        //product delete api 
        app.delete("/productAdd/:id", async (req, res) => {

            const result = await productCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });




        // Order Get api 

        app.get('/order', async (req, res) => {
            const cursor = await orderCollection.find({});
            const order = await cursor.toArray();
            res.send(order);
        });

        // Order POST API
        app.post('/order', async (req, res) => {
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder);

            console.log('hitting the post', result);
            res.json(result);
        })
        //Order delete api 
        app.delete("/order/:id", async (req, res) => {

            const result = await orderCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });
        // update user state
        app.put("/confirm/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };

            orderCollection.updateOne(filter, {
                $set: {
                    status: "Confirm"
                },
            })
                .then((result) => {
                    res.send(result);
                });

        });

        // GET API
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            console.log('ok done')
            res.send(review);
        })


        // Review POST API
        app.post('/review', async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview);

            console.log('hitting the post', result);
            res.json(result);
        })

        // find user admin or not
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            console.log("my admin ", isAdmin)
            res.json({ admin: isAdmin });
        })
        // User POST API
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);

            console.log('hitting the post', result);
            res.json(result);
        })
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            console.log('hitting the post', result);
            res.json(result);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('running');
});

app.listen(port, () => {
    console.log('server port', port);
})
