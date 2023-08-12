import React, {useRef, useState} from "react";
import {ErrorBoundary} from '../components/ErrorBoundary'

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

 
export default NotificationListItem;
