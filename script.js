document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:3001/products')
    .then(response => response.json())
    .then(data => {
      data.forEach(product => {
        addProductToDOM(product);
      });
    })
    .catch(error => console.error('Error fetching products:', error));
});

document.getElementById('productForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const name = formData.get('productName');
  const description = formData.get('productDescription');
  const price = formData.get('productPrice');
  const imageUrl = formData.get('productImage');

  const product = {
    name: name,
    description: description,
    price: parseFloat(price),
    imageUrl: imageUrl
  };

  fetch('http://localhost:3001/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(product)
  })
  .then(response => response.json())
  .then(data => {
    addProductToDOM(data);
    e.target.reset();
  })
  .catch(error => console.error('Error adding product:', error));
});

function addProductToDOM(product) {
  const productList = document.getElementById('products');

  const productDiv = document.createElement('div');
  productDiv.classList.add('product');
  productDiv.id = 'product' + product.id;

  productDiv.innerHTML = `
    <h3>${product.name}</h3>
    <img src="${product.imageUrl}" alt="${product.name}">
    <p>${product.description}</p>
    <span><strong>Valor:</strong> $${product.price}</span>
    <button class="delete-button" data-product-id="${product.id}">Eliminar</button>
    <button class="edit-button" data-product-id="${product.id}">Editar</button>
  `;

  productList.appendChild(productDiv);
}

document.addEventListener('click', async (event) => {
  const clickedElement = event.target;

  if (clickedElement.classList.contains('edit-button')) {
    const productId = clickedElement.getAttribute('data-product-id');
    await editProduct(productId);
  }

  if (clickedElement.classList.contains('delete-button')) {
    const productId = clickedElement.getAttribute('data-product-id');
    await deleteProduct(productId);
  }
});

async function deleteProduct(id) {
  if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    try {
      const response = await fetch(`http://localhost:3001/products/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const productElement = document.getElementById('product' + id);
        if (productElement) {
          productElement.parentNode.removeChild(productElement);
          alert('Producto eliminado con éxito');
        } else {
          console.error('No se encontró el elemento del producto en el DOM.');
        }
      } else {
        console.error('Error eliminando producto:', response.status);
        alert('Hubo un problema al eliminar el producto. Por favor, intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error durante la eliminación:', error);
      alert('Hubo un problema al eliminar el producto. Por favor, intenta nuevamente.');
    }
  }
}

async function editProduct(productId) {
  try {
    const response = await fetch(`http://localhost:3001/products/${productId}`);
    if (!response.ok) {
      throw new Error('Producto no encontrado');
    }

    const productData = await response.json();
    document.getElementById('editProductName').value = productData.name;
    document.getElementById('editProductDescription').value = productData.description;
    document.getElementById('editProductPrice').value = productData.price;
    document.getElementById('editProductImage').value = productData.imageUrl;

    document.getElementById('editForm').onsubmit = async function(e) {
      e.preventDefault();

      const editedProduct = {
        name: document.getElementById('editProductName').value,
        description: document.getElementById('editProductDescription').value,
        price: parseFloat(document.getElementById('editProductPrice').value),
        imageUrl: document.getElementById('editProductImage').value
      };

      try {
        const updateResponse = await fetch(`http://localhost:3001/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editedProduct)
        });

        if (updateResponse.ok) {
          const updatedProductData = await updateResponse.json();
          const productElement = document.getElementById('product' + productId);
          if (productElement) {
            productElement.querySelector('h3').textContent = updatedProductData.name;
            productElement.querySelector('img').src = updatedProductData.imageUrl;
            productElement.querySelector('p').textContent = updatedProductData.description;
            productElement.querySelector('span').innerHTML = `<strong>Valor:</strong> $${updatedProductData.price}`;
            alert('Producto actualizado con éxito');
          } else {
            console.error('No se encontró el elemento del producto en el DOM.');
          }
        } else {
          console.error('Error actualizando producto:', updateResponse.status);
          alert('Hubo un problema al actualizar el producto. Por favor, intenta nuevamente.');
        }
      } catch (error) {
        console.error('Error durante la actualización:', error);
        alert('Hubo un problema al actualizar el producto. Por favor, intenta nuevamente.');
      }
    };

    document.getElementById('editFormContainer').style.display = 'block';
  } catch (error) {
    console.error('Error obteniendo datos del producto:', error);
    alert('Hubo un problema al obtener los datos del producto. Por favor, intenta nuevamente.');
  }
}
