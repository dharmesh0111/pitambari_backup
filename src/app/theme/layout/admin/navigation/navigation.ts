import { style } from '@angular/animations';
import { Injectable } from '@angular/core';
import { GlobalService } from 'src/app/demo/core/services/global.service';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  icon?: string;
  url?: string;
  classes?: string;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: Navigation[];
}

export interface Navigation extends NavigationItem {
  children?: NavigationItem[];
}

const NavigationItems = [
  {
    id: 'dashboard',
    title: 'Menu',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'default',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/default',
        icon: 'ti ti-dashboard',
        // breadcrumbs: false
      }
    ]
  },
  {
    id: 'invoice',
    title: 'Invoice information',
    type: 'item',
    icon: 'ti ti-list',
    url: '/invoice-list',
    classes: 'nav-item'
  },
  {
    id: 'uploadInvoice',
    title: 'Upload Invoice',
    type: 'item',
    icon: 'ti ti-list',
    url: '/upload-invoice',
    classes: 'nav-item large-text'
  },
  
  {
    id: 'adminPanel',
    title: 'User management',
    type: 'item',
    icon: 'ti ti-number',
    url: '/Report',
    classes: 'nav-item',
    style: "font-size: 2004px;"
  }
];

@Injectable()
export class NavigationItem {
  constructor(private globalService: GlobalService) {}

  get() {


    // Clone the original NavigationItems to avoid mutating it
    const filteredNavigationItems = JSON.parse(JSON.stringify(NavigationItems));

    // Filter out the Admin Panel if the user is not an Admin
    if (this.globalService.getRealm() !== 'Admin') {
      const adminPanelIndex = filteredNavigationItems.findIndex(item => item.id === 'adminPanel');
      if (adminPanelIndex !== -1) {
        filteredNavigationItems.splice(adminPanelIndex, 1);
      }
    }
    return filteredNavigationItems;
  }
}