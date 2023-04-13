import "./App.css";
import { AccountList } from "./features/accounts/AccountList";
import "@shoelace-style/shoelace/dist/themes/light.css";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path";
import { ContractList } from "./features/accounts/ContractList";
import { Console } from "./features/console/Console";
import { Connection } from "./features/connection/Connection";
import { Configuration } from "./features/connection/Configuration";
import { Messages } from "./features/messages/Messages";
import { ExecuteOptions } from "./features/console/ExecuteOptions";
import { Header } from "./components/Header";
import { Donate } from "./features/accounts/Donate";
import { InstantiateOptions } from "./features/console/InstantiateOptions";
import { Menu } from "primereact/menu";
import { BechConverter } from "./features/tools/bechconverter";
import { MsgSigner } from "./features/tools/msgsigner";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

setBasePath(
    "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.64/dist/"
);
function App() {
    const navigate = useNavigate();
    const appLocation = useLocation();

    const menuItems = [
        {
            label: "Menu",
            items: [
                {
                    label: "Contract Explorer",
                    icon: "pi pi-home",
                    command: () => {
                        navigate("/");
                    },
                    className:
                        appLocation.pathname === "" ||
                        appLocation.pathname === "/"
                            ? "bg-gray-100"
                            : "",
                },
                {
                    label: "Bech Converter",
                    icon: "pi pi-arrow-right-arrow-left",
                    command: () => {
                        navigate("/bechconverter");
                    },
                    className:
                        appLocation.pathname.toLowerCase() === "/bechconverter"
                            ? "bg-gray-100"
                            : "",
                },
                {
                    label: "Msg Sign & Verify",
                    icon: "pi pi-check-circle",
                    command: () => {
                        navigate("/msgsigner");
                    },
                    className:
                        appLocation.pathname.toLowerCase() === "/msgsigner"
                            ? "bg-gray-100"
                            : "",
                },
            ],
        },
    ];

    return (
        <div className="main">
            <aside className="sidebar">
                <Header />
                <div className="border border-bottom py-2">
                    <AccountList />
                </div>
                <div className="sidebar-main flex-none">
                    <Menu model={menuItems} className="!w-full" />
                </div>
                <div className="sidebar-main grow">
                    <ContractList />
                </div>
                <div className="connection border border-top pt-2">
                    <Connection />
                </div>
            </aside>
            <section className="console">
                <Routes>
                    <Route path="/">
                        <Route index element={<Console />} />
                        <Route
                            path="bechconverter"
                            element={<BechConverter />}
                        />
                        <Route path="msgsigner" element={<MsgSigner />} />
                        <Route path="*" element={<Console />} />
                    </Route>
                </Routes>
            </section>
            <Configuration />
            <Messages />
            <ExecuteOptions />
            <InstantiateOptions />
            <Donate />
        </div>
    );
}

export default App;
