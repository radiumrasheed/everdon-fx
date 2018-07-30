import {Routes} from '@angular/router';

import {NotFoundComponent} from './404/not-found.component';
import {LockComponent} from './lock/lock.component';
import {Signup2Component} from './signup2/signup2.component';

export const AuthenticationRoutes: Routes = [
	{
		path: '',
		children: [{
			path: 'lock',
			component: LockComponent
		}, {
			path: 'signup2',
			component: Signup2Component
		}]
	}
];
