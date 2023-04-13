import { useAppDispatch } from "../app/hooks";
import { setDonationOpen } from "../features/accounts/accountsSlice";
import styles from "./Header.module.css";

export const Header = () => {
    const dispatch = useAppDispatch();
    return (
        <div className={`${styles.header} border border-bottom py-2`}>
            <span
                className={`${styles.name} text-lg w-full text-center m-auto block`}
            >
                Interchain Toolbox
            </span>
        </div>
    );
};
