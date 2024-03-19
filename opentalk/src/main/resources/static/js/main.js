function AddTalkList(){
    const addValue = document.getElementById("addValue").value;

    const li = document.createElement("li");

    li.setAttribute('id', addValue);

    const textNode = document.createTextNode(addValue);
    li.appendChild(textNode);

    document
        .getElementById('fruits')
        .appendChild(li);
}

function Popup_MakeRoom(){
    window.open("CreateRoom.html", "pop", "width=400,height=500,history=no,resizable=no,status=no,scrollbars=yes,menubar=no")
}