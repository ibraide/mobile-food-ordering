import { menuArray } from './data.js'

const orderList = document.getElementById("order-list")
const menuSection = document.getElementById("menu")
const checkout = document.getElementById("checkout")

let order = []    //empty array to store what the user has selected
let previousFocus = null

function getOrderTotal() {
  return order.reduce((total, item) => total + item.price * item.quantity, 0)
}

function closeCheckout() {
  checkout.classList.remove('open')
  checkout.innerHTML = ""

  if (previousFocus) {
    previousFocus.focus()
  }

  previousFocus = null
}

function renderMenu() {
    const menuItems = menuArray.map(item => { //menuArray.map(...) loops through each food item.
        return `
          <div class="menu-section">
            
                <p class="graphic" aria-hidden="true">${item.emoji}</p>
                <div>
                    <h3 class="food">${item.name}</h3>
                    <p class="condiments">${item.ingredients.join(", ")}</p>  
                    <p class="price">$${item.price}</p>
                </div>
                <button class="icon-btn" type="button" data-id="${item.id}" aria-label="Add ${item.name} to order">+</button>      
            
          </div>
        `
    }).join("") //.join("") merges the array of HTML strings into one big string.

    menuSection.innerHTML = `
      <h2 class="visually-hidden">Menu</h2>
      ${menuItems}
    `
}

function renderOrder(){

  if (order.length === 0) {
        orderList.innerHTML = ""
        return
    }

  const orderItems = order.map(item => {
    return ` 
        <div class="order-container">
            <div class="details">
              <p class="meal">${item.name} (x${item.quantity})</p>
              <button class="text-btn" type="button" data-remove="${item.id}" aria-label="Remove one ${item.name} from order">remove</button> 
            </div>
            <div>
              <p class="total">$${item.price * item.quantity}</p>
            </div>
          </div>
          
        `
    }).join("")

    // Wrap everything with header, total, and button
    orderList.innerHTML = `
      <h2>Your Order</h2>
      ${orderItems}
      <hr class="horizontal-line">
      <div class="total-container">
        <div>
          <p class="total-price">Total price:</p>
        </div>
        <div class="total-description">
          <p class="total">$${getOrderTotal()}</p>
        </div>
      </div>
      <div class="control-bar-container">
        <button class="complete-btn" type="button">Complete order</button>             
      </div>
    `
}

function addToYourOrder(itemId){              //addToOrder(itemId) finds the food in the array and appends it to .order-list
  const item = menuArray.find(food => food.id === itemId)       //checks if the food in the array has the same id as itemId
  const existingItem = order.find(food => food.id === itemId)

  if (!item) {
    return
  }

  if (existingItem){
      existingItem.quantity += 1      //if yes, increase the quanity by one hereby multiplying it by it's price
  } else {
    order.push({...item, quantity: 1})      //if no, push a new object or item with quantity 1
  }

  renderOrder()
}

function removeFromOrder (itemId){
  const existingItem = order.find(food => food.id === itemId)

  if (!existingItem) {
    return
  }

  if (existingItem.quantity > 1){
     existingItem.quantity -= 1 
  } else {
  order = order.filter(food => food.id !== itemId)    //filters out the item to remove from the list
  }
  renderOrder()                               //updates the display so the new quantities and totals stay calculated
}


// listen for add/remove clicks
menuSection.addEventListener("click", function(e){
  if(e.target.classList.contains("icon-btn")){
    const itemId = Number(e.target.dataset.id)          //converts the food item's id into a number
    addToYourOrder(itemId)                              //calls the function to add that specific food clicked on to the list
    orderList.scrollIntoView({ behavior: "smooth" });
  }

})

orderList.addEventListener("click", function(e){
  if(e.target.classList.contains("text-btn")){
    const itemId = Number(e.target.dataset.remove)
    removeFromOrder(itemId)
  } else if (e.target.classList.contains("complete-btn")){          //to complete the order, Open the modal when the button is clicked
      
    previousFocus = e.target
    checkout.classList.add('open');
    checkout.innerHTML =
      `
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="payment-title">
        <button class="modal-close-btn" type="button" aria-label="Close checkout">×</button>
        <h3 id="payment-title">Enter card details</h3>
        <form id="payment-form">
          <label class="visually-hidden" for="customer-name">Name</label>
          <input type="text" class="txt-edt text-edit" id="customer-name" name="customer-name" autocomplete="name" placeholder="Enter your name" required>
          <label class="visually-hidden" for="card-number">Card number</label>
          <input type="text" pattern="^\\d{4}(\\s?\\d{4}){3}$" maxlength="19" class="txt-edt text-edit card-number" id="card-number" name="card-number" autocomplete="cc-number" inputmode="numeric" placeholder="Enter card details" required>
          <label class="visually-hidden" for="cvv-number">CVV</label>
          <input type="text" pattern="^\\d{3}$" maxlength="3" class="txt-edt text-edit cvv-number" id="cvv-number" name="cvv-number" autocomplete="cc-csc" inputmode="numeric" placeholder="Enter CVV" required>
          <button class="btn-pay text-edit" type="submit">Pay</button>
        </form>
      </div>
      `
    document.getElementById("customer-name").focus()
  }
})

checkout.addEventListener("submit", function(e) {
  if(e.target.id === "payment-form"){
    e.preventDefault()
    const customerName = e.target.querySelector("input").value.trim()
    closeCheckout()
    order = []
    orderList.innerHTML = `<p class="thanks-message">Thanks, ${customerName}! Your order is on its way.</p>`
  }
})

checkout.addEventListener("click", function(e) {
  if(e.target.classList.contains("modal-close-btn")){
    closeCheckout()
  }
})

window.addEventListener("click", (event) => {     // Close the modal when clicking outside of the modal content
  if (event.target === checkout) {
    closeCheckout()
  }
});

window.addEventListener("keydown", function(e) {
  if(!checkout.classList.contains("open")){
    return
  }

  if(e.key === "Escape"){
    closeCheckout()
  }

  if(e.key === "Tab"){
    const focusableElements = checkout.querySelectorAll("button, input")
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if(e.shiftKey && document.activeElement === firstElement){
      e.preventDefault()
      lastElement.focus()
    } else if(!e.shiftKey && document.activeElement === lastElement){
      e.preventDefault()
      firstElement.focus()
    }
  }
})

// window.addEventListener("click", function(e){
//   if(e.target.classList.contains("btn-pay")){
//     checkout.classList.remove('open');
//     orderList.innerHTML = `Thanks, your order is on its way`
//   }
// })

window.addEventListener("input", function(e){
  if(e.target.classList.contains("card-number")){
    let value = e.target.value.replace(/\D/g, "")               // Remove all non-digits
    value = value.substring(0, 16)                            // Limit to max 16 digits
    let formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ")    // Add spaces every 4 digits  
    e.target.value = formatted                   // Update the field
  } else if(e.target.classList.contains("cvv-number")){
    let value = e.target.value.replace(/\D/g, "")               
    value = value.substring(0, 3)                    
    e.target.value = value               
  } 
})

renderMenu()
renderOrder()







 





//The button has data-id="${item.id}" so later you can attach event listeners and know which item was clicked while data-remove tells us which item to delete.
//item.ingredients.join(", ") ensures the array displays nicely as a comma-separated string.
//innerHTML injects that string into the page.
//
