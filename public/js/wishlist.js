const buttons = document.querySelectorAll(".wishlist-btn");

buttons.forEach(button => {
    button.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const listingId = button.dataset.id;
        try {
            const response = await fetch(`/wishlist/toggle/${listingId}`, {
                method: "POST"
            });
            const data = await response.json();
            if (data.success) {
                if (data.action === "added") {
                    button.classList.add("saved");
                    if (button.id === "wishlistBtn") {
                        button.innerHTML = "❤️ Saved";
                    } else {
                        button.innerHTML = "❤️";
                    }
                    showToast("Added to Wishlist ❤️");
                } else {
                    button.classList.remove("saved");
                    if (button.id === "wishlistBtn") {
                        button.innerHTML = "🤍 Add to Wishlist";
                    } else {
                        button.innerHTML = "🤍";
                    }
                    showToast("Removed from Wishlist");
                }
            }
        } catch (err) {
            console.log(err);
        }
    });
});

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "wishlist-toast";
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add("show");
    }, 100);
    setTimeout(() => {
        toast.remove();
    }, 2500);

}