import React, {useRef, useState} from "react";

import {
    Check as CheckIcon,
    ThumbUpAltOutlined as LikeIcon,
    Payment as PaymentIcon,
    CommentRounded as CommentIcon,
    MonetizationOnOutlined as MonetizationOnIcon,
    ExpandMoreOutlined as ExpandMoreIcon

} from "@mui/icons-material";
import {
    Button,
    ListItemIcon,
    ListItemText,
    ListItem,
    DialogTitle,
    DialogContent,
    DialogActions,
    Dialog,
    ListItemProps,
    useTheme,
    Icon,
    ListSubheader,
    ListItemButton
} from "@mui/material";

import makeStyles from '@mui/styles/makeStyles';

import JsonView from "../components/JsonTreeViewer";
import {NotificationResponseItem} from "../machines/notificationsMachine";
import {ThemeProvider} from "@mui/styles";

export type NotificationListItemProps = {
    notification: NotificationResponseItem;
    updateNotification: Function;

} & ListItemProps

const useStyles = makeStyles({
    card: {
        minWidth: "100%",
    },
    title: {
        fontSize: 18,
    },
    green: {
        color: "#4CAF50",
    },
    red: {
        color: "red",
    },
    blue: {
        color: "blue",
    },
});

const NotificationListItem: React.FC<NotificationListItemProps> = ({
                                                                       notification,
                                                                       updateNotification,
                                                                       ...rest
                                                                   }) => {

    const listItemIcon = <MonetizationOnIcon/>;

    const {
        title,
        payload,
        icon,
        group,
        severity,
        summary,
        info

    } = notification;

    const [expended, setExpended] = useState(false);
    const changeExpand = () => {
        setExpended(!expended)
    }
    const handleClose = () => {
        setExpended(false)
    }

    return (
        // <ThemeProvider theme={theme.palette.success}>
        <ListItem   {...rest} data-test={`notification-list-item-${notification.id}`}>

            <ListItemButton component={ListItemButton} onClick={changeExpand}>
                <ListItemIcon >
                    {(icon && <Icon baseClassName="material-icons material-icons-outlined">{icon}</Icon>
                    ) || listItemIcon!}
                </ListItemIcon>
                
                <ListItemText primary={title} secondary={summary} about={info}/>

            </ListItemButton>

            {/*<Button onClick={changeExpand} >*/}
            {/*    <ListItemIcon >*/}
            {/*        {(icon && <Icon baseClassName="material-icons material-icons-outlined">{icon}</Icon> */}
            {/*        ) || listItemIcon!}*/}
            {/*    </ListItemIcon>*/}
            {/*    <ListItemText primary={title} secondary={summary} about={info}/>*/}
            {/*    <ExpandMoreIcon/>*/}
            {/*</Button>*/}
            <Dialog
                open={expended}
                onClose={handleClose}
                scroll={'paper'}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle id="scroll-dialog-title">{title}</DialogTitle>
                <DialogContent dividers={true}>
                    <ErrorBoundary data={payload}>
                        <JsonView data={payload}/>
                    </ErrorBoundary>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>

        </ListItem>
        // </ThemeProvider>
    );
};

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{ data?: any }>, { hasError: boolean, error?: string }> {
    constructor(props: React.PropsWithChildren) {
        super(props);
        this.state = {hasError: false, error: undefined};
    }

    static getDerivedStateFromError(error: any) {
        // Update state so the next render will show the fallback UI.
        return {hasError: true, error: error};
    }

    componentDidCatch(error: any, errorInfo: any) {
        // You can also log the error to an error reporting service
        // console.error(error, errorInfo);
        console.error("failed to load data", this.props.data);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <div>
                <h1>Something went wrong.</h1>
            </div>
        }

        return this.props.children;
    }
}

export default NotificationListItem;
