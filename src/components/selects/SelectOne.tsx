import DialogSearchBar from '#mui/DialogSearchBar';
import DialogTitle from '#mui/DialogTitle';
import LazyAvatar from '#mui/LazyAvatar';
import Tooltip from '#mui/Tooltip';
import { Time } from '#utils/skyraUtils';
import { sleep } from '#utils/util';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core';
import Button, { ButtonProps as MButtonProps } from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { toTitleCase } from '@sapphire/utilities';
import React, { ChangeEvent, CSSProperties, forwardRef, Fragment, ReactNode, useCallback, useMemo, useState } from 'react';
import { Else, If, Then } from 'react-if';
import { Virtuoso } from 'react-virtuoso';
import type { Components } from 'react-virtuoso/dist/interfaces';

export interface SelectOneProps {
	label: string;
	name: ReactNode;
	values: {
		name: string;
		value: string;
		iconUrl?: string;
	}[];
	tooltipTitle?: string;
	buttonProps?: MButtonProps;
	imageInName?: string;

	onChange(...args: any[]): void;
}

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		dialogContent: {
			padding: theme.spacing(2)
		},
		dialogActions: {
			margin: 0,
			padding: theme.spacing(1)
		},
		nameImage: {
			display: 'inline-flex',
			height: theme.spacing(2),
			width: theme.spacing(2)
		},
		virtualizedList: {
			margin: theme.spacing(1)
		},
		virtualizedListContainer: {
			margin: 0,
			padding: 0
		}
	})
);

export default function SelectOne({ label, onChange, values, name = 'None', imageInName, tooltipTitle, buttonProps }: SelectOneProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState('');
	const classes = useStyles();
	const theme = useTheme();

	const handleClose = useCallback(async () => {
		// Close the dialog
		setOpen(!open);

		// Wait 1 second before clearing search because otherwise the resutls pop up while the dialog is animating away
		await sleep(Time.Second);

		// Clear the search
		setSearch('');
	}, [open]);

	const filteredValues = values.filter(({ name, value }) => {
		if (!search) return true;
		return `${name} ${value}`.toLowerCase().includes(search.toLowerCase());
	});

	const VirtuosoComponents = useMemo<Components>(
		() => ({
			List: forwardRef<HTMLDivElement, { style: CSSProperties }>(({ style, children }, listRef) => (
				<List style={{ ...style, width: '100%', margin: 0, padding: 0 }} ref={listRef} component="nav">
					{children}
				</List>
			)),

			Item: ({ children, ...props }) => (
				<ListItem
					{...props}
					button
					style={{ margin: 0 }}
					onClick={() => {
						onChange(filteredValues[props['data-index']].value);
						handleClose();
					}}
				>
					{children}
				</ListItem>
			)
		}),
		[filteredValues, handleClose, onChange]
	);

	return (
		<Fragment>
			<If condition={Boolean(tooltipTitle)}>
				<Then>
					<Tooltip title={tooltipTitle ?? ''} placement="top">
						<Button variant="contained" color="primary" onClick={() => setOpen(true)} {...buttonProps}>
							{label}: {name}{' '}
							{imageInName && (
								<LazyAvatar
									imgProps={{ height: theme.spacing(2), width: theme.spacing(2) }}
									alt="Emoji"
									src={imageInName}
									className={classes.nameImage}
								/>
							)}
						</Button>
					</Tooltip>
				</Then>
				<Else>
					<Button variant="contained" color="primary" onClick={() => setOpen(true)} {...buttonProps}>
						{label}: {name}{' '}
						{imageInName && (
							<LazyAvatar
								imgProps={{ height: theme.spacing(2), width: theme.spacing(2) }}
								alt="Emoji"
								src={imageInName}
								className={classes.nameImage}
							/>
						)}
					</Button>
				</Else>
			</If>
			<Dialog fullWidth maxWidth="xs" onClose={handleClose} open={open}>
				<DialogTitle onClose={handleClose}>{toTitleCase(label)}</DialogTitle>
				{values.length > 10 && <DialogSearchBar onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} />}
				<DialogContent dividers classes={{ root: classes.dialogContent }}>
					<Virtuoso
						totalCount={filteredValues.length}
						overscan={30}
						style={{ height: theme.spacing(50), width: '100%' }}
						className={classes.virtualizedList}
						components={VirtuosoComponents}
						itemContent={index => (
							<>
								<ListItemText primary={filteredValues[index].name} />
								{filteredValues[index].iconUrl && (
									<ListItemSecondaryAction>
										<LazyAvatar
											alt={filteredValues[index].value}
											src={filteredValues[index].iconUrl}
											variant="square"
										/>
									</ListItemSecondaryAction>
								)}
							</>
						)}
					/>
				</DialogContent>
				<DialogActions classes={{ root: classes.dialogActions }}>
					<Button
						onClick={() => {
							onChange(null);
							handleClose();
						}}
						color="primary"
					>
						Reset
					</Button>
				</DialogActions>
			</Dialog>
		</Fragment>
	);
}
