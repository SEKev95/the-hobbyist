const ul = document.querySelector('#myPosts');
ul.addEventListener('click', deletePost);

function deletePost(e) {
  if (e.target.classList.contains('fa-trash')) {
    var postId = e.target.closest('.post').querySelector('a').getAttribute('href').slice(9);
    fetch('delPost', {
      method: 'delete',
      headers: {'Content-Type' : 'application/json'},
      body: JSON.stringify({ id: postId })
    }).then(() => { window.location.reload() })  
  }
}