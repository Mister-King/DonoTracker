import axios from 'axios';
import qs from 'qs';
import Settings from '../config.json' with { type: 'json' };

const apiURL = 'https://api-m.paypal.com';

const getToken = () => new Promise((resolve, reject) => {
	const config = {
		method: 'post',
		url: `${apiURL}/v1/oauth2/token`,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		auth: {
			username: Settings.PPClientID,
			password: Settings.PPSecret,
		},
		data: qs.stringify({ 'grant_type': 'client_credentials' }),
	};

	axios(config)
		.then(response => {
			resolve(response.data.access_token);
		})
		.catch(error => {
			reject(error);
		});
});

export const getTransactions = () => new Promise((resolve, reject) => {
	getToken()
		.then(token => {
			const date = new Date();
			const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
			const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

			const config = {
				method: 'get',
				url: `${apiURL}/v1/reporting/transactions`,
				params: {
					start_date: firstDay,
					end_date: lastDay,
				},
				headers: {
					'Accept': 'application/json',
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			};

			axios(config)
				.then(response => {
					resolve(response.data.transaction_details);
				})
				.catch(error => {
					reject(error);
				});

		})
		.catch(error => {
			reject(error);
		});
});
