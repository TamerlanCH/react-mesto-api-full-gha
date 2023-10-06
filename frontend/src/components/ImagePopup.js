function ImagePopup({ card, onClose }) {
    return (
        <div className={`popup popup_picture ${card ? 'popup_opened' : ''}`}>
            <div className="popup__picture-container">
                <img className="popup__image" src={card ? card.link : ''} alt={card ? card.name : ''} />
                <p className="popup__picture-text">{card ? card.name : ''}</p>
                <button type="button" className="popup__close-button opacity" aria-label="Закрыть попап" onClick={onClose}></button>
            </div>
        </div>
    );
}
export default ImagePopup;
