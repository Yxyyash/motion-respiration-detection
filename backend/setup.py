from setuptools import setup, find_packages

setup(
    name='motion-flask',
    version='0.1',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'Flask',
        'flask-cors',
        'opencv-python',
        'numpy',
        'dlib',
        'scipy',
        'matplotlib'
    ],
)
