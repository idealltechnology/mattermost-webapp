// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ProductComponent} from '../types/store/plugins';

export const getCurrentProductId = (products: ProductComponent[] | undefined, pathname: string): string | null => {
    if (pathname.startsWith('/people')) {
        return 'product-people';
    }

    if (!products) {
        return null;
    }

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (pathname.startsWith(product.baseURL)) {
            return product.id;
        }
    }

    return null;
};
