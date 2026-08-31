import type { RouterMiddleware } from '@/app/types/router';
import { VIEWS } from '@/app/constants';
import type { InstanceOwnerMiddlewareOptions } from '@/app/types/rbac';
import { isInstanceOwner } from '@/app/utils/rbac/checks';

export const instanceOwnerMiddleware: RouterMiddleware<InstanceOwnerMiddlewareOptions> = async (
	_to,
	_from,
	next,
) => {
	const valid = isInstanceOwner();
	if (!valid) {
		return next({ name: VIEWS.HOMEPAGE });
	}
};
