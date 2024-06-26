import express from 'express';
import nunjucks from 'nunjucks';
import morgan from 'morgan';
import session from 'express-session';
import users from './users.json' assert { type: 'json' };
import stuffedAnimalData from './stuffed-animal-data.json' assert { type: 'json' };

const app = express();
const port = '8000';

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: false }));

nunjucks.configure('views', {
  autoescape: true,
  express: app,
});

function getAnimalDetails(animalId) {
  return stuffedAnimalData[animalId];
}

app.get('/', (req, res) => {
  res.render('index.html');
});

app.get('/all-animals', (req, res) => {
  res.render('all-animals.html.njk', { animals: Object.values(stuffedAnimalData) });
});

app.get('/animal-details/:animalId', (req, res) => {
  const animalDetails = getAnimalDetails(req.params.animalId)
  res.render('animal-details.html.njk', { animal: animalDetails });
});

app.get('/add-to-cart/:animalId', (req, res) => {
  //create a new session
  const session = req.session;
  //get the id of the animal added
  const animalId = req.params.animalId;
  //if the session cart doesnt exist, create one
  if (!session.cart) {
    session.cart = {};
  }
  //if the animal clicked on isn't in the cart yet, add it to the cart
  if (!(animalId in session.cart)) {
    session.cart[animalId] = 0;
  }
  //increase the count of the animal in the cart by 1
  session.cart[animalId] += 1;
  console.log(session.cart);

  //load the cart page
  res.redirect('/cart');
});

app.get('/cart', (req, res) => {
  console.log("cart endpoint hit")
  if (req.session.cart == false){
    req.session.cart = {}
  }
  // - get the cart object from the session
  const cart = req.session.cart
  // - create an array to hold the animals in the cart, and a variable to hold the total
  const animals = []
  // cost of the order
  let orderTotal = 0;

  // - loop over the cart object, and for each animal id:
  for (const animalId in cart){
    //   - get the animal object by calling getAnimalDetails
    const animalDetails = getAnimalDetails(animalId)
    const qty = cart[animalId]
     //   - compute the total cost for that type of animal
     const subTotal = qty * animalDetails.price
     //   - add quantity and total cost as properties on the animal object
    animalDetails.qty = qty
    animalDetails.subTotal = subTotal    
    //   - add this to the order total
    orderTotal = orderTotal + subTotal
    //   - add the animal object to the array created above
    animals.push(animalDetails)
  }
  // - pass the total order cost and the array of animal objects to the template
  res.render('cart.html.njk', { animals: animals, orderTotal: orderTotal })
  // Make sure your function can also handle the case where no cart has been added to the session
});

app.get('/checkout', (req, res) => {
  // Empty the cart.
  req.session.cart = {};
  res.redirect('/all-animals');
});

app.get('/login', (req, res) => {
  // TODO: Implement this
  res.send('Login has not been implemented yet!');
});

app.post('/process-login', (req, res) => {
  // TODO: Implement this
  res.send('Login has not been implemented yet!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}...`);
});
