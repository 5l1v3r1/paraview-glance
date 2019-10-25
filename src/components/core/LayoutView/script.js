import { mapActions, mapState } from 'vuex';

import VtkView from 'paraview-glance/src/components/core/VtkView';
import viewHelper from 'paraview-glance/src/components/core/VtkView/helper';
import { Breakpoints } from 'paraview-glance/src/constants';

// ----------------------------------------------------------------------------
// Component API
// ----------------------------------------------------------------------------

function setViewBackground(view, background) {
  this.$store.commit('viewSetBackground', {
    view,
    background,
  });
}

// ----------------------------------------------------------------------------

export default {
  name: 'LayoutView',
  components: {
    VtkView,
  },
  computed: {
    smallScreen() {
      return this.$vuetify.breakpoint.width < Breakpoints.md;
    },
    visibleViews() {
      return this.visibleViews.slice(0, this.visibleCount);
    },
    gridTemplateRows() {
      return this.visibleCount < 4 ? '1fr' : '1fr 1fr';
    },
    gridTemplateColumns() {
      return this.visibleCount < 2 ? '1fr' : '1fr 1fr';
    },
    ...mapState({
      visibleViews: (state) =>
        state.views.viewOrder.filter((v, i) => i < state.views.visibleCount),
      backgroundColors: (state) => state.views.backgroundColors,
      visibleCount(state) {
        // only show 1 view on small screens
        return this.smallScreen ? 1 : state.views.visibleCount;
      },
    }),
  },
  methods: {
    setViewBackground,
    getViewType: viewHelper.getViewType,
    getView(viewType) {
      const [type, name] = viewType.split(':');
      return this.$proxyManager
        .getViews()
        .find(
          (v) => v.getProxyName() === type && (!name || v.getName() === name)
        );
    },
    ...mapActions(['updateLayout']),
  },
  proxyManagerHooks: {
    onProxyCreated() {
      // reset cameras when first source is added
      if (this.$proxyManager.getSources().length === 1) {
        this.$proxyManager.resetCameraInAllViews();
      }
    },
  },
  updated() {
    this.$proxyManager.resizeAllViews();
  },
};
