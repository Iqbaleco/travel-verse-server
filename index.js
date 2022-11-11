const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ghgcuqm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('travelServiceDB').collection('services');
        const reviewCollection = client.db('travelServiceDB').collection('reviews');

        // Read API

        app.get('/limitedservices', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const limitedServices = await cursor.limit(3).toArray();
            res.send(limitedServices);
        });

        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            console.log(service);
            res.send(service);
        });

        app.get('/limitreviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const limitedReviews = await cursor.limit(3).toArray();
            res.send(limitedReviews);
        });

        app.get('/reviews', async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        })

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = await reviewCollection.findOne(query);
            console.log(review);
            res.send(review);
        })

        // Post API
        // Review Collection
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });


        app.post('/services', async (req, res) => {
            const service = req.body;
            const doc = {
                title: service.title,
                img: service.img,
                tmb_img: service.tmb_img,
                price: service.price,
                rating: service.rating,
                description: service.description,
                facility: [
                    {
                        name: service.facilityOneName,
                        details: service.facilityOneDetails
                    },
                    {
                        name: service.facilityTwoName,
                        details: service.facilityTwoDetails
                    }
                ]
            };
            const result = await serviceCollection.insertOne(doc);
            res.send(result);
        })

        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const review = req.body;
            const option = { upsert: true };
            const updatedReview = {
                $set: {
                    rating: review.rating,
                    reviewer: review.reviewer,
                    messege: review.messege
                }
            }
            const result = await reviewCollection.updateOne(filter, updatedReview, option);
            res.send(result);

        })

        // DELETE API

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query);
            console.log(result);
            res.send(result);
        })


    } finally {

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Server is running')
})

app.listen(port, () => {
    console.log(`Assignment 11 Server Side is running on ${port}`);
})