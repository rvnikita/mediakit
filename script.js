// Pricing configuration
const PRICING = {
    channelPost: 150,           // Отдельный пост
    channelNewsletter: 50,      // Weekly newsletter
    emailNewsletter: 80,        // Email-рассылка
    discountRate: 0.25,         // 25% discount
    discountThreshold: 3,       // Minimum items for discount

    // Chat prices
    defaultChatPrice: 30,       // Default price for most chats
    cultureChat: 80,            // Culture 🐻 in NYC
    parentsChat: 50,            // Parents 🐻 in NYC
    girlsChat: 50,              // Girls 🐻 in NYC
    rentalChat: 50,             // Rental 🐻 in NYC
    entrepreneursChat: 50,      // Entrepreneurs & Startups 🐻 in NYC
};

let selectedChats = [];
let autoCultureAdded = false;

function updateOrderSummary() {
    const selectedItemsDiv = document.getElementById('selectedItems');
    const totalPriceSpan = document.getElementById('totalPrice');
    const orderButton = document.getElementById('orderButton');

    let items = [];
    let chatsTotal = 0;
    let discount = 0;
    let paidItemsCount = 0;

    // Calculate chats total
    selectedChats.forEach(chat => {
        chatsTotal += chat.price;
        if (chat.price > 0) paidItemsCount += 1;
    });

    // Apply discount if threshold met
    if (paidItemsCount >= PRICING.discountThreshold) {
        discount = chatsTotal * PRICING.discountRate;
    }

    const chatsAfterDiscount = chatsTotal - discount;

    if (selectedChats.length === 0) {
        selectedItemsDiv.innerHTML = '<p class="empty-message">Выберите чаты для расчёта стоимости</p>';
        orderButton.disabled = true;
        totalPriceSpan.textContent = '$0';
        return;
    }

    const postSelected = channelOptionPost && channelOptionPost.checked;

    // Show individual items
    selectedChats.forEach(chat => {
        // Skip Culture chat if it's auto-included via crosspost
        if (chat.name === 'Culture 🐻 in NYC' && chat.price === 0 && postSelected) {
            return;
        }
        items.push({
            name: chat.name,
            price: chat.price,
            isFree: chat.price === 0
        });
    });

    // Add discount
    if (discount > 0) {
        const discountPercent = Math.round(PRICING.discountRate * 100);
        items.push({
            name: `Скидка ${discountPercent}% (${PRICING.discountThreshold}+ мест размещения)`,
            price: -discount,
            isDiscount: true
        });
    }

    // Crosspost info if отдельный пост выбран
    if (postSelected) {
        items.push({
            name: 'Автоматический кросспост в Culture 🐻 in NYC (бесплатно)',
            isInfoOnly: true
        });
    }

    selectedItemsDiv.innerHTML = items.map(item => {
        if (item.isDiscount) {
            return `
                <div class="selected-item discount">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">-$${Math.abs(item.price).toFixed(0)}</span>
                </div>
            `;
        }
        if (item.isInfoOnly) {
            return `
                <div class="selected-item">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">Бесплатно</span>
                </div>
            `;
        }
        if (item.isFree) {
            return `
                <div class="selected-item">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">Бесплатно</span>
                </div>
            `;
        }
        return `
            <div class="selected-item">
                <span class="item-name">${item.name}</span>
                <span class="item-price">$${item.price}</span>
            </div>
        `;
    }).join('');

    orderButton.disabled = false;
    const finalTotal = chatsAfterDiscount;

    totalPriceSpan.textContent = `$${finalTotal.toFixed(0)}`;
}

document.querySelectorAll('input[name="chat"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        // Special handling for Culture chat
        if (this.dataset.name === 'Culture 🐻 in NYC') {
            const postSelected = channelOptionPost && channelOptionPost.checked;

            if (postSelected) {
                // Отдельный пост включает Culture бесплатно и фиксирует выбор
                this.checked = true;
                updateChannelPrice();
                return;
            }
        }

        // Determine price based on chat name
        let price = PRICING.defaultChatPrice;
        if (this.dataset.name === 'Culture 🐻 in NYC') {
            price = PRICING.cultureChat;
        } else if (this.dataset.name === 'Email-рассылка') {
            price = PRICING.emailNewsletter;
        } else if (this.dataset.name === 'Parents 🐻 in NYC') {
            price = PRICING.parentsChat;
        } else if (this.dataset.name === 'Girls 🐻 in NYC') {
            price = PRICING.girlsChat;
        } else if (this.dataset.name === 'Rental 🐻 in NYC') {
            price = PRICING.rentalChat;
        } else if (this.dataset.name === 'Entrepreneurs & Startups 🐻 in NYC') {
            price = PRICING.entrepreneursChat;
        }

        const chat = {
            name: this.dataset.name,
            price: price
        };

        if (this.checked) {
            selectedChats.push(chat);
        } else {
            selectedChats = selectedChats.filter(c => c.name !== chat.name);
        }
        updateOrderSummary();
    });
});

// Channel option pricing adjustments
const channelCheckbox = document.getElementById('channelCheckbox');
const channelOptionPost = document.getElementById('channelOptionPost');
const channelOptionNewsletter = document.getElementById('channelOptionNewsletter');
const cultureChatCheckbox = document.getElementById('cultureChatCheckbox');
const cultureChatPrice = document.getElementById('cultureChatPrice');

function updateChannelPrice() {
    // Remove existing channel sub-options from selectedChats
    selectedChats = selectedChats.filter(c =>
        c.name !== 'Еженедельная подборка' &&
        c.name !== 'Отдельный пост' &&
        c.name !== 'Culture 🐻 in NYC' &&
        c.name !== 'in NYC'
    );

    const postSelected = channelOptionPost && channelOptionPost.checked;
    const newsletterSelected = channelOptionNewsletter && channelOptionNewsletter.checked;

    // Add checked sub-options as separate items
    if (newsletterSelected) {
        selectedChats.push({
            name: 'Еженедельная подборка',
            price: PRICING.channelNewsletter
        });
    }
    if (postSelected) {
        selectedChats.push({
            name: 'Отдельный пост',
            price: PRICING.channelPost
        });
    }

    // Handle Culture chat auto-inclusion
    if (postSelected) {
        // Отдельный пост: автокросспост в Culture бесплатно
        selectedChats.push({
            name: 'Culture 🐻 in NYC',
            price: 0
        });
        if (cultureChatPrice) cultureChatPrice.textContent = '$0';
        if (cultureChatCheckbox) {
            cultureChatCheckbox.checked = true;
        }
        autoCultureAdded = true;
    } else {
        // Restore culture price and state when отдельный пост снят
        if (cultureChatPrice) cultureChatPrice.textContent = `$${PRICING.cultureChat}`;

        if (autoCultureAdded && cultureChatCheckbox) {
            cultureChatCheckbox.checked = false;
        }
        autoCultureAdded = false;

        if (cultureChatCheckbox && cultureChatCheckbox.checked) {
            selectedChats.push({
                name: 'Culture 🐻 in NYC',
                price: PRICING.cultureChat
            });
        }
    }

    // Update main channel checkbox state
    if (channelCheckbox) channelCheckbox.checked = postSelected && newsletterSelected;

    updateOrderSummary();
}

// Auto-select/deselect channel options when main channel is selected/deselected
if (channelCheckbox) {
    channelCheckbox.addEventListener('change', function() {
        if (this.checked) {
            // Auto-select both options
            if (channelOptionPost) channelOptionPost.checked = true;
            if (channelOptionNewsletter) channelOptionNewsletter.checked = true;
            updateChannelPrice();
        } else {
            // Deselect both options
            if (channelOptionPost) channelOptionPost.checked = false;
            if (channelOptionNewsletter) channelOptionNewsletter.checked = false;
            updateChannelPrice();
        }
    });
}

// Listen to channel option changes
if (channelOptionPost) {
    channelOptionPost.addEventListener('change', updateChannelPrice);
}
if (channelOptionNewsletter) {
    channelOptionNewsletter.addEventListener('change', updateChannelPrice);
}

const orderButton = document.getElementById('orderButton');
orderButton.addEventListener('click', () => {
    if (orderButton.disabled) return;

    const chatsText = selectedChats.map(c => `${c.name} - $${c.price}`).join('\n');
    const discountPercent = Math.round(PRICING.discountRate * 100);
    let paidItemsCount = 0;
    selectedChats.forEach(chat => {
        if (chat.price > 0) paidItemsCount += 1;
    });
    const discount = paidItemsCount >= PRICING.discountThreshold
        ? `\nСкидка ${discountPercent}% (${PRICING.discountThreshold}+ мест размещения)`
        : '';
    const total = document.getElementById('totalPrice').textContent;

    const mailtoLink = `mailto:nikita@rvachev.org?subject=Запрос на размещение&body=` +
        encodeURIComponent(
            `==Информация об мероприятии==\n\n` +
            `Название:\n` +
            `Дата и время мероприятия:\n` +
            `Адрес:\n` +
            `Описание:\n` +
            `Ссылка на регистрацию или лендинг:\n\n` +
            `(приложите изображение)\n\n` +
            `Выбранные места размещения:\n${chatsText}${discount}\n\n` +
            `Итого: ${total}\n\n` +
            `P.S. После получения емейла менеджер свяжется с информацией по оплате и информации о размещении.`
        );

    window.location.href = mailtoLink;
});

// Set current year in footer
document.getElementById('currentYear').textContent = new Date().getFullYear();
