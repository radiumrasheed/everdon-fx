import {RouteInfo} from './sidebar.metadata';

export const ROUTES: RouteInfo[] = [

	{
		path: '/me/dashboard', title: 'Dashboard', icon: 'mdi mdi-gauge', class: '', label: '', labelClass: '', extralink: false, submenu: [], role: 'client'
	},
	{
		path: '/admin/dashboard', title: 'Admin Dashboard', icon: 'mdi mdi-gauge', class: '', label: '', labelClass: '', extralink: false, submenu: [], role: 'admin'
	},
	{
		path: '/me/transaction/request',
		title: 'New Request',
		icon: 'mdi mdi-certificate',
		class: '',
		label: '',
		labelClass: '',
		extralink: false,
		role: 'client',
		submenu: []
	},
	{
		path: '/me/transaction', title: 'My Transactions', icon: 'mdi mdi-receipt', class: '', label: '', labelClass: '', extralink: false, submenu: [], role: 'client'
	},
	{
		path: '/me/profile',
		title: 'Profile',
		icon: 'mdi mdi-account-settings-variant',
		class: '',
		label: '',
		labelClass: '',
		extralink: false,
		role: 'client',
		submenu: []
	},
	{
		path: '',
		title: 'Transactions',
		icon: 'mdi mdi-receipt',
		class: 'has-arrow',
		label: '',
		labelClass: '',
		extralink: false,
		role: 'admin',
		submenu: [
			{path: '/admin/transaction', title: 'All Transactions', icon: '', class: '', label: '', labelClass: '', extralink: false, submenu: []},
			{
				path: '/admin/transaction/request',
				title: 'Make Transaction',
				icon: '',
				class: '',
				label: '',
				labelClass: '',
				extralink: false,
				submenu: []
			}
		]
	},
	{
		path: '',
		title: 'Customers',
		icon: 'mdi mdi-account-multiple',
		class: 'has-arrow',
		label: '',
		labelClass: '',
		extralink: false,
		role: 'admin',
		submenu: [
			{path: '/admin/customers', title: 'All Customers', icon: 'mdi mdi-account-network', class: '', label: '', labelClass: '', extralink: false, submenu: []},
			{
				path: '/admin/create_customer',
				title: 'Create Customer',
				icon: 'mdi mdi-account-plus',
				class: '',
				label: '',
				labelClass: '',
				extralink: false,
				submenu: []
			}
		]
	}

];

