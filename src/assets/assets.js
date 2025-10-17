import pet_group from "./pets.jpg"
import arrow from "./arrow_icon.svg"
import fuel from "./fuel_icon.svg"
import search from "./search_icon.svg"
import filter from "./filter_icon.svg"
import logo from "./logo.png"
import profile from "./profile_pic.png"
import dropdown from "./dropdown_icon.svg"
import check from "./check_icon.png"
import user from "./users_icon.svg"
import calendar from "./calendar_icon_colored.png"
import user_profile from "./shakespeare.webp"
import edit from "./edit_icon.svg"
import dashboard from "./dashboardIcon.png"
import dashboard_colored from "./dashboardIconColored.png"
import add from "./addIcon.png"
import add_colored from "./addIconColored.png"
import list from "./listIcon.png"
import list_colored from "./listIconColored.png"
import petIcon from "./petIcon.png"
import petIcon_colored from "./petIconColored.png"
import inventoryIcon from "./inventoryIcon.png"
import inventoryIconColored from "./inventoryIconColored.png"
import edit_black from "./edit_black.png"
import cat1 from "./cat1.jpg"
import cat2 from "./cat2.jpg"
import cat3 from "./cat3.jpg"
import cat4 from "./cat4.jpg"
import dog1 from "./dog1.jpg"
import dog2 from "./dog2.jpg"
import dog3 from "./dog3.jpg"
import dog4 from "./dog4.jpg"
import parrot1 from "./parrot1.jpg"
import parrot2 from "./parrot2.jpg"
import parrot3 from "./parrot3.jpg"
import parrot4 from "./parrot4.jpg"
import rabbit1 from "./rabbit1.jpg"
import rabbit2 from "./rabbit2.jpg"
import rabbit3 from "./rabbit3.jpg"
import rabbit4 from "./rabbit4.jpg"
import pigeon1 from "./pigeon1.jpg"
import pigeon2 from "./pigeon2.jpg"
import pigeon3 from "./pigeon3.jpg"
import pigeon4 from "./pigeon4.jpg"
import food from "./food.png"
import color from "./color.png"
import dog_icon1 from "./dog_icon1.png"
import cat_icon from "./cat_icon.png"
import accept from "./accept.svg"
import reject from "./reject.svg"
import testimonial_img1 from "./testimonial_image_1.png"
import testimonial_img2 from "./testimonial_image_2.png"
import star from "./star_icon.png"
import pets_n from "./pets_n.png"
import pets_home from "./pets_home.jpeg"
import pets_home2 from "./pets_home2.jpg"

export const assets = {
    pet_group,
    arrow,
    fuel,
    search,
    filter,
    logo,
    profile,
    dropdown,
    check,
    user,
    calendar,
    user_profile,
    edit,
    dashboard,
    dashboard_colored,
    add,
    add_colored,
    list,
    list_colored,
    petIcon,
    petIcon_colored,
    inventoryIcon,
    inventoryIconColored,
    edit_black,cat1,
    cat2,
    cat3,
    cat4,
    dog1,
    dog2,
    dog3,
    dog4,
    parrot1,
    parrot2,
    parrot3,
    parrot4,
    rabbit1,
    rabbit2,
    rabbit3,
    rabbit4,
    pigeon1,
    pigeon2,
    pigeon3,
    pigeon4,
    food,
    color,
    dog_icon1,
    cat_icon,
    accept,
    reject,
    testimonial_img1,
    testimonial_img2,
    star,
    pets_n,
    pets_home,
    pets_home2
}

export const adminMenuLinks = [
    { name: "Dashboard", path: "/admin", icon: dashboard, coloredIcon: dashboard_colored },
    { name: "Manage Pets", path: "/admin/manage-pet", icon: petIcon, coloredIcon: petIcon_colored },
    { name: "Manage Adoption", path: "/admin/manage-adoption", icon: list, coloredIcon: list_colored },
    { name: "Manage Inventory", path: "/admin/manage-inventory", icon: inventoryIcon, coloredIcon: inventoryIconColored },
]

export const caretakerMenuLinks = [
    { name: "Dashboard", path: "/caretaker", icon: dashboard, coloredIcon: dashboard_colored },
    { name: "Add Pet", path: "/caretaker/add-pet", icon: add, coloredIcon: add_colored },
]

export const doctorMenuLinks = [
    { name: "Dashboard", path: "/doctor-dashboard", icon: dashboard, coloredIcon: dashboard_colored},
]