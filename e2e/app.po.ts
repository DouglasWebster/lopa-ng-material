import { browser, by, element } from 'protractor';

export class LopaNgMaterialPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('lpa-root h1')).getText();
  }
}
