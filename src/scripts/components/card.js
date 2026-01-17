export const updateLikeCount = (cardElement, likesCount) => {
  const likeCountElement = cardElement.querySelector(".card__like-count");
  likeCountElement.textContent = likesCount;
};

export const toggleLikeButton = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

const isCardLiked = (likes, userId) => {
  return likes.some((user) => user._id === userId);
};

export const createCardElement = (
  data,
  userId,
  { onPreviewPicture, onLikeIcon, onDeleteCard }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCount = cardElement.querySelector(".card__like-count");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  likeCount.textContent = data.likes.length;

  if (isCardLiked(data.likes, userId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (data.owner._id !== userId) {
    deleteButton.remove();
  } else if (onDeleteCard) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data._id));
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () =>
      onLikeIcon(cardElement, likeButton, data._id)
    );
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link })
    );
  }

  return cardElement;
};