import axios, {
    AxiosResponse,
    AxiosError
} from "../../node_modules/axios/index";
//import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from "../../node_modules/vue-qrcode-reader";
// import VueQrcodeReader from "../../node_modules/vue-qrcode-reader/index";

let baseCycleUrl: string = "https://mort-rest.azurewebsites.net/api/cycles/"
let baseUserUrl: string = "https://mort-rest.azurewebsites.net/api/users/"

interface ICycle {
    cycle_id: number
    cycle_name: string
    cycle_coordinates: string
    fk_cycle_status_id: number
}
interface IUser {
    user_id: number
    user_email: string
    user_password: string
    user_firstname: string
    user_lastname: string
    user_mobile: number
    fk_account_status_id: number
}


new Vue({
    el: "#app",
    data: {
        loggedIn: true,
        loginPage: false,
        createUserPage: false,
        overviewPage: false,
        cyclePage: false,
        cycle_id: 1,
        QR_ScanPage: true,
        singleCycle: null,
        loginEmail: "",
        loginPassword: "",
        addData: { user_email: "", user_password: "", user_firstname: "", user_lastname: "", user_mobile: 0 },
        errorMessage: "",
        addMessage: "",
        cycles: []
    }, created(){
        console.log(window.location.search)
        this.getOneBike(this.cycle_id)
    },
    methods: {
        login() {
            if (this.loginEmail == "test" && this.loginPassword == "test") { //axios get
                this.loggedIn = true
            } else {
                this.errorMessage = "Wrong"
            }

        },
        loginTry(vendor: string) {
            var mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            if(this.loginEmail.match(mailformat))
            {
            this.LoginHelpAndShow(baseUserUrl + this.loginEmail + '/' + this.loginPassword)
            }
            else
            {
            this.errorMessage = "Dette er ikke en rigtig email!";
            }
        },
        LoginHelpAndShow(url: string) { // helper metode: getAllCar + getByVendor are very similar
            axios.get<IUser[]>(url)
                .then((response: AxiosResponse<IUser[]>) => {
                    this.loggedIn = response.data
                    if(this.loggedIn == true)
                    {
                        this.user_email = this.loginEmail
                        this.loggedIn = response.data
                        console.log(`Denne bruger email er blevet logget ind "${this.user_email}" `)
                    }
                   
                    this.errorMessage = "Forkert brugernavn eller password"
                })
                .catch((error: AxiosError) => {
                    error.message = this.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        logout() {
            this.loggedIn = false
        }, createPage() {
            this.createUserPage = true
            this.loginPage = false

        },
        QRPage() {
            this.QR_ScanPage = true
            this.overviewPage = false
            this.cyclePage = false
        },
        helperGetAndShow(url: string) { // helper metode: getAllCar + getByVendor are very similar
            axios.get<ICycle[]>(url)
                .then((response: AxiosResponse<ICycle[]>) => {
                    this.cycles = response.data
                })
                .catch((error: AxiosError) => {
                    //this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        getAllBikes() {
            this.helperGetAndShow(baseCycleUrl)
        },
        getOneBike(id: number) {
            let urlGet = baseCycleUrl + id
            axios.get<ICycle>(urlGet)
                .then((response: AxiosResponse<ICycle>) => {
                    this.singleCycle = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message)
                })
        },
        addUser() {
            axios.post<IUser>(baseUserUrl, this.addData)
                .then((response: AxiosResponse) => {
                    let message: string = "response " + response.status + " " + response.statusText
                    this.addMessage = message

                })
                .catch((error: AxiosError) => {
                    // this.addMessage = error.message
                    alert(error.message)
                })
        },
    }
})