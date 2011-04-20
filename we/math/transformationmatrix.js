/*
 * Copyright (C) 2011 Klokan Technologies GmbH (info@klokantech.com)
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU GPL for more details.
 *
 * USE OF THIS CODE OR ANY PART OF IT IN A NONFREE SOFTWARE IS NOT ALLOWED
 * WITHOUT PRIOR WRITTEN PERMISSION FROM KLOKAN TECHNOLOGIES GMBH.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 */

/**
 * @fileoverview Object encapsulating 4x4 transformation matrix and operations.
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 */

goog.provide('we.math.TransformationMatrix');

goog.require('goog.array');
goog.require('goog.math');
goog.require('goog.math.Matrix');



/**
 * New 4x4 transformation matrix initialized to identity.
 * @constructor
 */
we.math.TransformationMatrix = function() {
  /**
   * @type {!goog.math.Matrix}
   * @private
   */
  this.matrix_ = goog.math.Matrix.createIdentityMatrix(4);
};


/**
 * @return {!goog.math.Matrix} Standard matrix.
 */
we.math.TransformationMatrix.prototype.getStandardMatrix = function() {
  return this.matrix_;
};


/**
 * Loads 4x4 identity
 */
we.math.TransformationMatrix.prototype.loadIdentity = function() {
  this.matrix_ = goog.math.Matrix.createIdentityMatrix(4);
};


/**
 * Multiplies current model-view matrix to represent translation by (x,y,z)
 * @param {number} x X translation.
 * @param {number} y Y translation.
 * @param {number} z Z translation.
 */
we.math.TransformationMatrix.prototype.translate = function(x, y, z) {
  this.matrix_ = this.matrix_.multiply(new goog.math.Matrix([
    [1, 0, 0, x],
    [0, 1, 0, y],
    [0, 0, 1, z],
    [0, 0, 0, 1]
  ]));
};


/**
 * Multiplies the current matrix by a matrix representing a scaling operation.
 * @param {number} x X scale.
 * @param {number} y Y scale.
 * @param {number} z Z scale.
 */
we.math.TransformationMatrix.prototype.scale = function(x, y, z) {
  this.matrix_ = this.matrix_.multiply(new goog.math.Matrix([
    [x, 0, 0, 0],
    [0, y, 0, 0],
    [0, 0, z, 0],
    [0, 0, 0, 1]
  ]));
};


/**
 * Computes a matrix that performs a counterclockwise rotation of given angle
 * about the vector from the origin through the point (x, y, z).
 * @param {number} angle Angle to rotate in radians.
 * @param {number} x X translation.
 * @param {number} y Y translation.
 * @param {number} z Z translation.
 */
we.math.TransformationMatrix.prototype.rotate = function(angle, x, y, z) {
  /** @type {number} */
  var c = Math.cos(angle);

  /** @type {number} */
  var s = Math.sin(angle);

  this.matrix_ = this.matrix_.multiply(new goog.math.Matrix([
    [x * x * (1 - c) + c, x * y * (1 - c) - z * s, x * z * (1 - c) + y * s, 0],
    [y * x * (1 - c) + z * s, y * y * (1 - c) + c, y * z * (1 - c) - x * s, 0],
    [z * x * (1 - c) - y * s, z * y * (1 - c) + x * s, z * z * (1 - c) + c, 0],
    [0, 0, 0, 1]
  ]));
};


/**
 * Optimized function for rotating around (0, 1, 0).
 * @param {number} angle Angle to rotate in radians.
 */
we.math.TransformationMatrix.prototype.rotate010 = function(angle) {
  /** @type {number} */
  var c = Math.cos(angle);

  /** @type {number} */
  var s = Math.sin(angle);

  this.matrix_ = this.matrix_.multiply(new goog.math.Matrix([
    [c, 0, s, 0],
    [0, 1, 0, 0],
    [-s, 0, c, 0],
    [0, 0, 0, 1]
  ]));
};


/**
 * Optimized function for rotating around (1, 0, 0).
 * @param {number} angle Angle to rotate in radians.
 */
we.math.TransformationMatrix.prototype.rotate100 = function(angle) {
  /** @type {number} */
  var c = Math.cos(angle);

  /** @type {number} */
  var s = Math.sin(angle);

  this.matrix_ = this.matrix_.multiply(new goog.math.Matrix([
    [1, 0, 0, 0],
    [0, c, -s, 0],
    [0, s, c, 0],
    [0, 0, 0, 1]
  ]));
};


/**
 * Optimized function for rotating around (0, 0, 1).
 * @param {number} angle Angle to rotate in radians.
 */
we.math.TransformationMatrix.prototype.rotate001 = function(angle) {
  /** @type {number} */
  var c = Math.cos(angle);

  /** @type {number} */
  var s = Math.sin(angle);

  this.matrix_ = this.matrix_.multiply(new goog.math.Matrix([
    [c, -s, 0, 0],
    [s, c, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ]));
};


/**
 * @param {!goog.math.Vec3} eye Position of eye.
 * @param {!goog.math.Vec3} center Position to look to.
 * @param {!goog.math.Vec3} up "up" vector.
 */
we.math.TransformationMatrix.prototype.lookAt = function(eye, center, up) {

  var fw = center.subtract(eye).normalize();

  var side = goog.math.Vec3.cross(fw, up).normalize();
  up = goog.math.Vec3.cross(side, fw);

  this.matrix = this.matrix_.multiply(new goog.math.Matrix([
    [side.x, side.y, side.z, 0],//-eye.x * (side.x + side.y + side.z)],
    [up.x, up.y, up.z, 0],//-eye.y * (up.x + up.y + up.z)],
    [-fw.x, -fw.y, -fw.z, 0],//eye.z * (fw.x + fw.y + fw.z)],
    [0, 0, 0, 1]
  ]));

  this.translate(-eye.x, -eye.y, -eye.z);
};


/**
 * Returns the inverse of the top left 3x3 submatrix.
 * @return {!goog.math.Matrix} The inverse of the top left 3x3 submatrix.
 */
we.math.TransformationMatrix.prototype.getInverseMat3 = function() {
  // FIXME There's probably a more efficient way to do this, copying rows or
  //       similar
  var m = new goog.math.Matrix(new goog.math.Size(3, 3));
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; ++j) {
      /* Assume that i, j are in range so getValue at always returns a number */
      m.setValueAt(i, j, (/** @type {number} */ this.matrix_.getValueAt(i, j)));
    }
  }
  /* Assume that our matricies are always invertible */
  return (/** @type {!goog.math.Matrix} */ m.getInverse());
};