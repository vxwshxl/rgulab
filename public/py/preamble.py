# Runs once when the simulator boots. Makes plt.show() and fig.show() send
# their output to the page instead of trying to open a window.
import os, io, base64, sys, warnings

warnings.filterwarnings("ignore", message=".*as_object_map.*")

os.environ["MPLBACKEND"] = "Agg"
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import dslab_bridge


def _flush_figures():
    for num in plt.get_fignums():
        fig = plt.figure(num)
        buf = io.BytesIO()
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            fig.savefig(buf, format="png", dpi=110, bbox_inches="tight")
        dslab_bridge.emit("image", base64.b64encode(buf.getvalue()).decode())
    plt.close("all")


def _show(*args, **kwargs):
    _flush_figures()


plt.show = _show
matplotlib.figure.Figure.show = lambda self, *a, **k: _flush_figures()


def _patch_plotly():
    try:
        import plotly.basedatatypes as _bd
    except Exception:
        return

    def _fig_show(self, *a, **k):
        dslab_bridge.emit("html", self.to_html(include_plotlyjs="cdn", full_html=True))

    _bd.BaseFigure.show = _fig_show


def _patch_nltk():
    try:
        import nltk
    except Exception:
        return
    if "/home/pyodide/nltk_data" not in nltk.data.path:
        nltk.data.path.insert(0, "/home/pyodide/nltk_data")
    nltk.download = lambda *a, **k: True


def _run_user_code(code, filename="program.py"):
    """Execute code in a fresh namespace, like Spyder's Run File (F5)."""
    import traceback, linecache

    linecache.cache[filename] = (len(code), None, code.splitlines(True), filename)
    ns = {"__name__": "__main__", "__file__": filename}
    try:
        exec(compile(code, filename, "exec"), ns)
        return True
    except SystemExit:
        return True
    except BaseException:
        etype, value, tb = sys.exc_info()
        # Drop our own frame so the traceback starts at the user's code.
        tb = tb.tb_next if tb is not None else tb
        sys.stderr.write("".join(traceback.format_exception(etype, value, tb)))
        return False
    finally:
        _flush_figures()
