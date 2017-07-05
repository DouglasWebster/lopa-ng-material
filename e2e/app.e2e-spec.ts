import { LopaNgMaterialPage } from './app.po';

describe('lopa-ng-material App', () => {
  let page: LopaNgMaterialPage;

  beforeEach(() => {
    page = new LopaNgMaterialPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to lpa!!');
  });
});
