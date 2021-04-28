const postList = document.querySelector('.indPost');
postList.addEventListener('click', deletePost);

function deletePost(e) {console.log(e.target.classList)
  if (e.target.classList.contains('fa-trash')) {
    var postId = e.target.closest('.post').querySelector('.id').getAttribute('href').slice(10);
    fetch('delPost', {
      method: 'delete',
      headers: {'Content-Type' : 'application/json'},
      body: JSON.stringify({ id: postId })
    }).then(() => { window.location.reload() })  
  }
}
document.querySelector('.newButton').addEventListener('click' , newFollow)
function newFollow(e){
let otherUser = e.target.parentNode.dataset.id
  console.log(e.target.parentNode.dataset)
  fetch('/follow/' + otherUser) , {
    method: 'put', 
    headers: {'Content-Type' : 'application/json'},
  }.then(() => { window.location.reload() })  
  
}
// Array.from(thumbUp).forEach(function(element) {
//   element.addEventListener('click', function(){
//     const name = this.parentNode.parentNode.childNodes[1].innerText
//     const msg = this.parentNode.parentNode.childNodes[3].innerText
//     const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
//     fetch('messages', {
//       method: 'put',
//       headers: {'Content-Type': 'application/json'},
//       body: JSON.stringify({
//         'name': name,
//         'msg': msg,
//         'thumbUp':thumbUp
//       })
//     })
//     .then(response => {
//       if (response.ok) return response.json()
//     })
//     .then(data => {
//       console.log(data)
//       window.location.reload(true)
//     })
//   });
// });