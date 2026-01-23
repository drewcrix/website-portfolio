document.addEventListener('DOMContentLoaded', () => {

  // Mobile: toggle dropdown on tap
  document.querySelectorAll('.nav-item.dropdown > a').forEach(dropdownToggle => {
    dropdownToggle.addEventListener('click', function (e) {
      if (window.innerWidth < 992) {
        e.preventDefault();
        const menu = this.nextElementSibling;
        menu.classList.toggle('show');
      }
    });
  });

  // Mobile: close dropdown after selecting an item
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      item.closest('.dropdown-menu')?.classList.remove('show');
    });
  });
  fetch("footer.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("footer").innerHTML = data;
    document.getElementById("year").textContent = new Date().getFullYear();
  });

});


