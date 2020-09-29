const newUser = () => {
    const user = {
        isEditing: false,
        isDragging: false,
        pause: false,
        isPlaying: false,
    };
    localStorage.setItem("user", JSON.stringify(user));
    return user;
};

const storedUser = localStorage.getItem("user");
const User = storedUser ? JSON.parse(storedUser) : newUser();

export default User;
