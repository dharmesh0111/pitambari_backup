import { environment } from "src/environments/environment"

export class RestApi{

    public readonly secretKey = `5454SDer4F$%$#$Ffdsfdsfd`;
    public readonly BASE_URL = `${environment.apiUrl}`;
    public readonly LOGIN_URL=  `${this.BASE_URL}/api/accountusers/login?include=["user"]`;
    // public readonly LOGOUT_URL=  `${this.BASE_URL}/api/accountusers/logout`;
    // public readonly REGISTER_URL=  `${this.BASE_URL}/api/accountusers/register`;
    // public readonly FORGOTPASSWORD_URL=  `${this.BASE_URL}/api/accountusers/forgotPassword`;
    // public readonly VERIFYFORGOTPASSWORD_URL=  `${this.BASE_URL}/api/accountusers/verifyforgototp`;
    
}