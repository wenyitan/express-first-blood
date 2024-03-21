function addUser(event){
    event.preventDefault();
    const addUserForm = document.getElementById("add-user-form");
    let formData = new FormData(addUserForm);
    let body = {};
    for (let [i, j] of formData.entries()) {
        body[i] = j
    }
    fetch("http://localhost:3000/users/user", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    })
    .then((response)=> {
        console.log(response)
        return response.json();
    })
    .then((resp)=> {
        console.log("resp from server ", resp)
        fetchAll();
    })
}

const addUserForm = document.getElementById("add-user-form");

const fetchAll = () => {
    fetch("http://localhost:3000/users/all", {
        method: "GET"
    })
    .then((response)=> {
        return response.json();
    })
    .then((resp)=> {
        const tbody = document.querySelector("tbody");
        tbody.innerHTML = '';
        const template = document.getElementById("template");
        for (data in resp) {
            const clone = template.content.cloneNode(true);
            let td = clone.querySelectorAll("td");
            td[0].textContent = resp[data].firstName;
            td[1].textContent = resp[data].lastName;
            td[2].textContent = resp[data].address;
            tbody.appendChild(clone);
        }
    })
}

addUserForm.addEventListener("submit", addUser);

fetchAll();