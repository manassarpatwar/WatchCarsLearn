const newUser = () => {
    const user = {
        isEditing: false,
        isDragging: false,
        pause: false,
    };
    localStorage.setItem("User", JSON.stringify(user));
    return user;
}

const storedUser = localStorage.getItem("User");
const User = storedUser ? JSON.parse(storedUser) : newUser();
   
export default User;