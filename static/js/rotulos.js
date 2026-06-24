(function() {
    const cartItems = {};
    const cartContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');

    function actualizarCarrito() {
        const entries = Object.entries(cartItems);
        if (entries.length === 0) {
            cartContainer.innerHTML = '<div class="cart-empty">Aún no agregaste productos.<br>Seleccioná uno de la lista.</div>';
            cartTotal.style.display = 'none';
            return;
        }
        let html = '';
        entries.forEach(([key, item]) => {
            html += `
                <div class="cart-item" data-key="${key}">
                    <div class="cart-item-info">
                        <div class="cart-product-name">${item.nombre}</div>
                        <div class="cart-date">Elab: ${item.fecha || '—'}</div>
                    </div>
                    <button class="btn-remove" style="background:none;border:1px solid var(--danger);color:var(--danger);padding:2px 8px;font-size:0.7rem;cursor:pointer;">X</button>
                </div>
            `;
        });
        cartContainer.innerHTML = html;
        cartTotal.style.display = 'block';
        cartCount.textContent = entries.length;
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const key = this.closest('.cart-item').dataset.key;
                delete cartItems[key];
                actualizarCarrito();
            });
        });
    }

    function generarKey(nombre, fecha) {
        return nombre + '__' + (fecha || 'sin-fecha');
    }

    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.product-card');
            const nombre = this.dataset.nombre;
            const fechaInput = card.querySelector('.fecha-input');
            const fecha = fechaInput ? fechaInput.value : '';
            if (!fecha) {
                alert('Por favor seleccioná una fecha de elaboración.');
                return;
            }
            const key = generarKey(nombre, fecha);
            if (cartItems[key]) {
                alert('Este producto con esa fecha ya está en la lista.');
                return;
            }
            cartItems[key] = { nombre, fecha };
            actualizarCarrito();
            fechaInput.value = '';
        });
    });

    document.getElementById('btn-crear-rotulos').addEventListener('click', function() {
        const entries = Object.entries(cartItems);
        if (entries.length === 0) {
            alert('Agregá al menos un producto a la lista.');
            return;
        }
        alert('¡Rótulos generados! (Funcionalidad en desarrollo — próximamente podrás imprimirlos)');
    });
})();
